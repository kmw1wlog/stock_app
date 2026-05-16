#!/usr/bin/env python3
"""Cross backtest: lasting-theme daily filter -> minute formulas.

Theme proxy:
  Use WRDS `ggroup` as a practical theme bucket for KOSDAQ history.

Theme persistence heuristic:
  Prefer groups with strong recent 5-day momentum, positive breadth, and
  above-normal turnover/dollar-volume while avoiding the most overextended
  1-day spikes. Then keep only stocks inside the chosen themes and feed those
  stock-days into minute formula backtests.
"""

from __future__ import annotations

import argparse
import gc
import json
import re
import sys
from collections import defaultdict
from concurrent.futures import ProcessPoolExecutor, as_completed
from multiprocessing import get_context
from pathlib import Path
from typing import Any

import pandas as pd

ROOT = Path("/home/openq/code/stock_app-main")
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

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
from scripts.backtest_kosdaq_daily_to_minute import (
    FORMULA_KEYS,
    blank_formula_stats,
    merge_serialized_formula_stats,
    serialize_formula_stats,
    write_checkpoint,
)
from scripts.backtest_kosdaq_horizontal_disclosures import (
    aggregate_disclosure_daily,
    assign_trade_dates,
    classify_receipts,
    load_receipt_times,
    load_receipts,
)

DAILY_PARTS_ROOT = ROOT / "E_kosdaq_daily_wrds" / "daily_kosdaq" / "kosdaq_iqc_daily_full_history" / "derived" / "kosdaq_common_daily_parts"
KOSDAQ_1M_ROOT = ROOT / "B_kosdaq_1m_parquet" / "output_parquet_kosdaq" / "1m"


def load_daily_with_theme(start_date: str, theme_level: str) -> pd.DataFrame:
    start_ts = pd.Timestamp(start_date)
    frames: list[pd.DataFrame] = []
    for file in sorted(DAILY_PARTS_ROOT.glob("kosdaq_common_daily_*.parquet")):
        stamp = re.search(r"_(\d{4})_(\d{2})\.parquet$", file.name)
        if not stamp:
            continue
        year = int(stamp.group(1))
        month = int(stamp.group(2))
        if pd.Timestamp(year=year, month=month, day=1) < start_ts.replace(day=1):
            continue
        part = pd.read_parquet(
            file,
            columns=[
                "date",
                "isin",
                "ggroup",
                "gind",
                "close_raw",
                "volume_shares",
                "dollar_volume",
                "market_cap",
                "turnover",
                "is_active",
            ],
        )
        frames.append(part)
    frame = pd.concat(frames, ignore_index=True)
    frame["date"] = pd.to_datetime(frame["date"])
    frame = frame[frame["date"] >= start_ts].copy()
    frame["stock_code"] = frame["isin"].astype(str).str[3:9]
    frame["close"] = pd.to_numeric(frame["close_raw"], errors="coerce")
    frame["volume"] = pd.to_numeric(frame["volume_shares"], errors="coerce")
    frame["dollar_volume"] = pd.to_numeric(frame["dollar_volume"], errors="coerce")
    frame["market_cap"] = pd.to_numeric(frame["market_cap"], errors="coerce")
    frame["turnover"] = pd.to_numeric(frame["turnover"], errors="coerce")
    frame["dollar_volume"] = frame["dollar_volume"].fillna(frame["close"] * frame["volume"])
    if theme_level == "gind":
        frame["theme_key"] = frame["gind"].fillna(frame["ggroup"]).astype(str)
    else:
        frame["theme_key"] = frame["ggroup"].fillna(frame["gind"]).astype(str)
    frame = frame[
        frame["is_active"].fillna(False)
        & frame["stock_code"].str.fullmatch(r"\d{6}", na=False)
        & (frame["close"] > 0)
        & (frame["volume"] > 0)
        & (frame["market_cap"] > 0)
        & frame["theme_key"].notna()
    ].copy()
    return frame[
        [
            "date",
            "stock_code",
            "theme_key",
            "close",
            "volume",
            "dollar_volume",
            "market_cap",
            "turnover",
        ]
    ].sort_values(["stock_code", "date"]).reset_index(drop=True)


def add_stock_features(frame: pd.DataFrame) -> pd.DataFrame:
    stock = frame.groupby("stock_code", sort=False)
    out = frame.copy()
    out["ret_1d"] = stock["close"].pct_change()
    out["ret_5d"] = stock["close"].pct_change(5)
    out["dollar_volume_avg20"] = stock["dollar_volume"].shift(1).rolling(20, min_periods=10).mean()
    out["turnover_avg20"] = stock["turnover"].shift(1).rolling(20, min_periods=10).mean()
    out["dollar_volume_ratio20"] = out["dollar_volume"] / out["dollar_volume_avg20"].clip(lower=1.0)
    out["turnover_ratio20"] = out["turnover"] / out["turnover_avg20"].clip(lower=1e-6)
    return out


def add_theme_features(frame: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    out = frame.copy()
    out["up_flag"] = (out["ret_1d"].fillna(0) > 0).astype(int)
    daily_theme = (
        out.groupby(["date", "theme_key"], sort=False)
        .agg(
            theme_return_1d=("ret_1d", "mean"),
            theme_return_5d=("ret_5d", "mean"),
            breadth_up=("up_flag", "mean"),
            theme_dollar_volume=("dollar_volume", "sum"),
            theme_turnover_mean=("turnover", "mean"),
            stock_count=("stock_code", "nunique"),
        )
        .reset_index()
    )
    theme = daily_theme.groupby("theme_key", sort=False)
    daily_theme["theme_dollar_volume_avg20"] = theme["theme_dollar_volume"].shift(1).rolling(20, min_periods=10).mean()
    daily_theme["theme_turnover_avg20"] = theme["theme_turnover_mean"].shift(1).rolling(20, min_periods=10).mean()
    daily_theme["theme_volume_ratio20"] = daily_theme["theme_dollar_volume"] / daily_theme["theme_dollar_volume_avg20"].clip(lower=1.0)
    daily_theme["theme_turnover_ratio20"] = daily_theme["theme_turnover_mean"] / daily_theme["theme_turnover_avg20"].clip(lower=1e-6)
    daily_theme["theme_size_score"] = daily_theme["stock_count"].clip(lower=1, upper=15) / 15.0

    for col in [
        "theme_return_5d",
        "breadth_up",
        "theme_volume_ratio20",
        "theme_turnover_ratio20",
    ]:
        daily_theme[f"rank_{col}"] = daily_theme.groupby("date")[col].rank(pct=True)
    daily_theme["rank_theme_return_1d"] = daily_theme.groupby("date")["theme_return_1d"].rank(pct=True)
    daily_theme["theme_week_score"] = (
        0.30 * daily_theme["rank_theme_return_5d"].fillna(0)
        + 0.25 * daily_theme["rank_breadth_up"].fillna(0)
        + 0.20 * daily_theme["rank_theme_volume_ratio20"].fillna(0)
        + 0.15 * daily_theme["rank_theme_turnover_ratio20"].fillna(0)
        + 0.10 * daily_theme["theme_size_score"].fillna(0)
        - 0.10 * daily_theme["rank_theme_return_1d"].fillna(0).where(daily_theme["theme_return_1d"] > 0.08, 0)
    )
    return out, daily_theme


def build_selected_stock_days(
    start_date: str,
    top_themes_per_day: int,
    max_stocks_per_theme_day: int,
    theme_level: str,
    min_theme_score: float,
    min_breadth_up: float,
    min_theme_ret_5d: float,
    min_theme_volume_ratio20: float,
) -> tuple[dict[str, list[int]], dict[str, Any]]:
    daily = load_daily_with_theme(start_date, theme_level)
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
    frame = add_stock_features(frame)
    frame["stock_day_score"] = (
        0.45 * frame.groupby("date")["dollar_volume_ratio20"].rank(pct=True).fillna(0)
        + 0.25 * frame.groupby("date")["turnover_ratio20"].rank(pct=True).fillna(0)
        + 0.20 * frame.groupby("date")["ret_5d"].rank(pct=True).fillna(0)
        + 0.10 * frame.groupby("date")["ret_1d"].rank(pct=True).fillna(0)
    )
    frame, theme_daily = add_theme_features(frame)
    chosen_themes = theme_daily[
        (theme_daily["theme_week_score"] >= min_theme_score)
        & (theme_daily["breadth_up"] >= min_breadth_up)
        & (theme_daily["theme_return_5d"] >= min_theme_ret_5d)
        & (theme_daily["theme_volume_ratio20"] >= min_theme_volume_ratio20)
    ].copy()
    chosen_themes = chosen_themes.sort_values(["date", "theme_week_score"], ascending=[True, False])
    if top_themes_per_day > 0:
        chosen_themes = chosen_themes.groupby("date", sort=False).head(top_themes_per_day)
    chosen_themes = chosen_themes[["date", "theme_key", "theme_week_score"]]
    selected = frame.merge(chosen_themes, on=["date", "theme_key"], how="inner")
    selected = (
        selected.sort_values(["date", "theme_key", "stock_day_score"], ascending=[True, True, False])
        .groupby(["date", "theme_key"], sort=False)
        .head(max_stocks_per_theme_day)
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
        "selectedThemesPerDay": int(top_themes_per_day),
        "stocksPerThemeDay": int(max_stocks_per_theme_day),
        "themeLevel": theme_level,
        "minThemeScore": float(min_theme_score),
        "minBreadthUp": float(min_breadth_up),
        "minThemeRet5d": float(min_theme_ret_5d),
        "minThemeVolumeRatio20": float(min_theme_volume_ratio20),
        "themeDayRows": int(len(chosen_themes)),
        "dateRange": [
            str(selected["date"].min().date()) if len(selected) else None,
            str(selected["date"].max().date()) if len(selected) else None,
        ],
    }
    del daily, receipts, times, disclosure_daily, frame, theme_daily, chosen_themes, selected
    gc.collect()
    return stock_days, meta


def process_symbol(
    symbol_dir_str: str,
    allowed_dates: list[int],
    horizon_bars: int,
    minute_surge_pct: float,
    cooldown_bars: int,
    min_amount: float,
) -> dict[str, Any] | None:
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
    stats = {key: FormulaStats() for key in FORMULA_KEYS}
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
    return {
        "baseline_total": baseline_total,
        "baseline_hits": baseline_hits,
        "formula_stats": serialize_formula_stats(stats),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--start-date", default="2000-03-01")
    parser.add_argument("--top-themes-per-day", type=int, default=5)
    parser.add_argument("--stocks-per-theme-day", type=int, default=10)
    parser.add_argument("--theme-level", choices=["ggroup", "gind"], default="ggroup")
    parser.add_argument("--min-theme-score", type=float, default=0.60)
    parser.add_argument("--min-breadth-up", type=float, default=0.50)
    parser.add_argument("--min-theme-ret-5d", type=float, default=0.03)
    parser.add_argument("--min-theme-volume-ratio20", type=float, default=1.00)
    parser.add_argument("--minute-surge-pct", type=float, default=3.0)
    parser.add_argument("--horizon-bars", type=int, default=120)
    parser.add_argument("--cooldown-bars", type=int, default=30)
    parser.add_argument("--min-amount", type=float, default=2_000_000_000)
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--max-symbols", type=int, default=400)
    parser.add_argument("--checkpoint-every", type=int, default=50)
    parser.add_argument("--out", default="public/data/kosdaq-theme-daily-to-minute-sample400.json")
    args = parser.parse_args()

    print("rebuilding theme-filtered daily matched stock-days...", flush=True)
    selected_days, meta = build_selected_stock_days(
        args.start_date,
        args.top_themes_per_day,
        args.stocks_per_theme_day,
        args.theme_level,
        args.min_theme_score,
        args.min_breadth_up,
        args.min_theme_ret_5d,
        args.min_theme_volume_ratio20,
    )
    selected_symbols = set(selected_days)
    print(
        {
            "dailySelectedStockDays": meta["dailySelectedStockDays"],
            "dailySelectedSymbols": meta["dailySelectedSymbols"],
            "themeDayRows": meta["themeDayRows"],
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
                baseline_total += result["baseline_total"]
                baseline_hits += result["baseline_hits"]
                merge_serialized_formula_stats(agg_stats, result["formula_stats"])
            if processed % args.checkpoint_every == 0 or processed == len(symbol_dirs):
                print({"processed": processed, "of": len(symbol_dirs), "baselineTotal": baseline_total}, flush=True)
                write_checkpoint(
                    out_path,
                    f"{args.theme_level}_theme_week_score",
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
