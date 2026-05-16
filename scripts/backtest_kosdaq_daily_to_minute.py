#!/usr/bin/env python3
"""Cross backtest: KOSDAQ daily selector -> intraday minute formulas.

This script is designed to be resilient on large local datasets:
1. Rebuild selected stock-days from the daily selector.
2. Persist the compact stock-day map to disk.
3. Release the large daily DataFrame before minute processing.
4. Process minute parquet symbol-by-symbol with spawn workers.
5. Save progress checkpoints periodically.
"""

from __future__ import annotations

import argparse
import gc
import json
import sys
from collections import defaultdict
from concurrent.futures import ProcessPoolExecutor, as_completed
from dataclasses import asdict, dataclass
from multiprocessing import get_context
from pathlib import Path
from typing import Any

import pandas as pd

ROOT = Path("/home/openq/code/stock_app-main")
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.backtest_kosdaq_horizontal_disclosures import (
    add_cross_sectional_scores,
    add_disclosure_features,
    add_price_features,
    aggregate_disclosure_daily,
    assign_trade_dates,
    classify_receipts,
    future_max_returns,
    load_daily_history,
    load_receipt_times,
    load_receipts,
)
from scripts.backtest_kr_1m_formulas import (
    FormulaStats,
    add_features,
    cooldown_indices,
    formula_masks,
    future_metrics,
    list_symbol_dirs,
    load_symbol_frame,
    symbol_from_dir,
)


KOSDAQ_1M_ROOT = ROOT / "B_kosdaq_1m_parquet" / "output_parquet_kosdaq" / "1m"
FORMULA_KEYS = [
    "A_volume_spike",
    "B_prev_high_approach",
    "C_new_high_breakout",
    "D_box_breakout",
    "E_pullback_rebreak",
    "F_follow_through",
    "H_risk_watch",
    "I_opening_gap_hold",
    "J_morning_high_rebreak",
    "K_vwap_reclaim",
    "M_market_relative_strength",
    "N_afternoon_reacceleration",
    "O_limit_up_watch",
]


@dataclass
class WorkerResult:
    symbol: str
    baseline_total: int
    baseline_hits: int
    formula_stats: dict[str, dict[str, float]]


def blank_formula_stats() -> dict[str, FormulaStats]:
    return {key: FormulaStats() for key in FORMULA_KEYS}


def serialize_formula_stats(stats: dict[str, FormulaStats]) -> dict[str, dict[str, float]]:
    return {
        key: {
            "signals": stat.signals,
            "hits": stat.hits,
            "future_return_sum": stat.future_return_sum,
            "max_drawdown_sum": stat.max_drawdown_sum,
        }
        for key, stat in stats.items()
    }


def merge_serialized_formula_stats(target: dict[str, FormulaStats], payload: dict[str, dict[str, float]]) -> None:
    for key, raw in payload.items():
        target[key].signals += int(raw["signals"])
        target[key].hits += int(raw["hits"])
        target[key].future_return_sum += float(raw["future_return_sum"])
        target[key].max_drawdown_sum += float(raw["max_drawdown_sum"])


def build_selected_stock_days(start_date: str, selector: str, top_k: int) -> tuple[dict[str, list[int]], dict[str, Any]]:
    daily = load_daily_history(start_date)
    trading_dates = pd.DatetimeIndex(sorted(daily["date"].drop_duplicates().tolist()))
    receipts, _ = load_receipts()
    times, _ = load_receipt_times()
    if not times.empty:
        receipts = receipts.merge(times[["rcept_no", "receipt_time"]], on="rcept_no", how="left")
    else:
        receipts["receipt_time"] = pd.NA
    receipts = classify_receipts(receipts)
    receipts = assign_trade_dates(receipts, trading_dates)
    disclosure_daily = aggregate_disclosure_daily(receipts)
    frame = daily.merge(disclosure_daily, on=["stock_code", "date"], how="left")
    for col in ["receipt_count_1d", "irregular_count_1d", "mezzanine_count_1d"]:
        frame[col] = frame[col].fillna(0.0)
    frame = add_price_features(frame)
    frame = add_disclosure_features(frame)
    frame = future_max_returns(frame, [7, 14, 30])
    frame = add_cross_sectional_scores(frame)
    selected = (
        frame[frame[selector].notna()]
        .sort_values(["date", selector], ascending=[True, False])
        .groupby("date", sort=False)
        .head(top_k)
        .copy()
    )
    selected["date_int"] = selected["date"].dt.strftime("%Y%m%d").astype(int)
    stock_days: dict[str, list[int]] = {}
    tmp: dict[str, set[int]] = defaultdict(set)
    for stock_code, date_int in selected[["stock_code", "date_int"]].itertuples(index=False):
        tmp[str(stock_code)].add(int(date_int))
    for stock_code, values in tmp.items():
        stock_days[stock_code] = sorted(values)

    meta = {
        "dailySelectedStockDays": int(len(selected)),
        "dailySelectedSymbols": int(selected["stock_code"].nunique()),
        "dateRange": [
            str(selected["date"].min().date()) if len(selected) else None,
            str(selected["date"].max().date()) if len(selected) else None,
        ],
    }

    del daily
    del receipts
    del times
    del disclosure_daily
    del frame
    del selected
    gc.collect()
    return stock_days, meta


def process_symbol(
    symbol_dir_str: str,
    allowed_dates: list[int],
    horizon_bars: int,
    minute_surge_pct: float,
    cooldown_bars: int,
    min_amount: float,
) -> WorkerResult | None:
    symbol_dir = Path(symbol_dir_str)
    symbol = symbol_from_dir(symbol_dir)
    dfm = load_symbol_frame(symbol_dir)
    if dfm.empty:
        return None
    dfm = add_features(dfm, {})
    dfm = future_metrics(dfm, horizon_bars)
    date_mask = dfm["date"].astype(int).isin(allowed_dates)
    baseline_df = dfm[date_mask & dfm["future_max_return_pct"].notna() & (dfm["cum_amount"] >= min_amount)]
    baseline_total = int(len(baseline_df))
    baseline_hits = int((baseline_df["future_max_return_pct"] >= minute_surge_pct).sum()) if baseline_total else 0
    stats = blank_formula_stats()
    masks = formula_masks(dfm, min_amount)
    for key in FORMULA_KEYS:
        idxs = cooldown_indices(masks[key] & date_mask, dfm, cooldown_bars)
        if not idxs:
            continue
        sub = dfm.loc[idxs]
        sub = sub[sub["cum_amount"] >= min_amount]
        if sub.empty:
            continue
        hits = sub["future_max_return_pct"] >= minute_surge_pct
        stats[key].add_many(hits, sub["future_max_return_pct"], sub["future_max_drawdown_pct"])
    return WorkerResult(
        symbol=symbol,
        baseline_total=baseline_total,
        baseline_hits=baseline_hits,
        formula_stats=serialize_formula_stats(stats),
    )


def write_checkpoint(
    out_path: Path,
    selector: str,
    minute_target: str,
    symbol_dirs: list[Path],
    baseline_total: int,
    baseline_hits: int,
    agg_stats: dict[str, FormulaStats],
    meta: dict[str, Any],
    processed: int,
) -> None:
    baseline_rate = baseline_hits / baseline_total if baseline_total else 0.0
    formula_rows = []
    for key, stat in agg_stats.items():
        if stat.signals < 30:
            continue
        hit_rate = stat.hits / stat.signals
        formula_rows.append(
            {
                "formulaKey": key,
                "signals": stat.signals,
                "hitRate": round(hit_rate, 4),
                "liftVsDailyMatchedMinuteBaseline": round(hit_rate / baseline_rate, 2) if baseline_rate else None,
                "avgFutureMaxReturnPct": round(stat.future_return_sum / stat.signals, 2),
            }
        )
    formula_rows.sort(key=lambda row: (-row["liftVsDailyMatchedMinuteBaseline"], -row["signals"]))
    payload = {
        "generatedAt": pd.Timestamp.now("UTC").isoformat(),
        "selector": selector,
        "processedMinuteSymbols": processed,
        "totalMinuteSymbols": len(symbol_dirs),
        "minuteTarget": minute_target,
        "selectedStockDayMinuteBaselineTotal": baseline_total,
        "selectedStockDayMinuteBaselineHitRate": round(baseline_rate, 4),
        "formulaResults": formula_rows,
        "dailyMeta": meta,
    }
    out_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--selector", default="base_selector_score")
    parser.add_argument("--start-date", default="2000-03-01")
    parser.add_argument("--top-k", type=int, default=50)
    parser.add_argument("--minute-surge-pct", type=float, default=3.0)
    parser.add_argument("--horizon-bars", type=int, default=120)
    parser.add_argument("--cooldown-bars", type=int, default=30)
    parser.add_argument("--min-amount", type=float, default=2_000_000_000)
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--max-symbols", type=int, default=400)
    parser.add_argument("--checkpoint-every", type=int, default=50)
    parser.add_argument("--out", default="public/data/kosdaq-daily-base-to-minute-formulas-sample400.json")
    args = parser.parse_args()

    print("rebuilding daily matched stock-days...", flush=True)
    selected_days, meta = build_selected_stock_days(args.start_date, args.selector, args.top_k)
    selected_symbols = set(selected_days)
    print(
        {
            "dailySelectedStockDays": meta["dailySelectedStockDays"],
            "dailySelectedSymbols": meta["dailySelectedSymbols"],
        },
        flush=True,
    )

    symbol_dirs = [sd for sd in list_symbol_dirs(KOSDAQ_1M_ROOT) if symbol_from_dir(sd) in selected_symbols]
    if args.max_symbols > 0:
        symbol_dirs = symbol_dirs[: args.max_symbols]
    print({"minuteSymbolDirs": len(symbol_dirs)}, flush=True)

    out_path = ROOT / args.out
    out_path.parent.mkdir(parents=True, exist_ok=True)
    agg_stats = blank_formula_stats()
    baseline_total = 0
    baseline_hits = 0
    processed = 0
    minute_target = f"신호 후 {args.horizon_bars}개 1분봉 내 고가 +{args.minute_surge_pct}%"

    ctx = get_context("spawn")
    with ProcessPoolExecutor(max_workers=args.workers, mp_context=ctx) as executor:
        futures = [
            executor.submit(
                process_symbol,
                str(symbol_dir),
                selected_days[symbol_from_dir(symbol_dir)],
                args.horizon_bars,
                args.minute_surge_pct,
                args.cooldown_bars,
                args.min_amount,
            )
            for symbol_dir in symbol_dirs
        ]
        for future in as_completed(futures):
            result = future.result()
            processed += 1
            if result is not None:
                baseline_total += result.baseline_total
                baseline_hits += result.baseline_hits
                merge_serialized_formula_stats(agg_stats, result.formula_stats)
            if processed % args.checkpoint_every == 0 or processed == len(symbol_dirs):
                print({"processed": processed, "of": len(symbol_dirs), "baselineTotal": baseline_total}, flush=True)
                write_checkpoint(
                    out_path,
                    args.selector,
                    minute_target,
                    symbol_dirs,
                    baseline_total,
                    baseline_hits,
                    agg_stats,
                    meta,
                    processed,
                )

    print(out_path)


if __name__ == "__main__":
    main()
