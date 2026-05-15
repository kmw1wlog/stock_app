#!/usr/bin/env python3
"""Backtest A~P formula signals on historical KR 1-minute parquet data.

Target definition:
  A signal is a "surge hit" if the maximum high within the next N 1-minute bars
  reaches current close * (1 + surge_pct).

Baseline:
  All eligible stock-minutes in the same dataset, using the same future surge
  target. Formula lift = formula hit rate / baseline hit rate.

The script processes each symbol partition independently, so it can run on large
KOSPI/KOSDAQ minute datasets without loading the full market into memory.
"""

from __future__ import annotations

import argparse
import json
import math
import re
from concurrent.futures import ProcessPoolExecutor, as_completed
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd


FORMULA_NAMES = {
    "A_volume_spike": "거래량 폭발형",
    "B_prev_high_approach": "전고점 접근형",
    "C_new_high_breakout": "신고가 돌파형",
    "D_box_breakout": "박스권 상단 돌파형",
    "E_pullback_rebreak": "눌림 후 재돌파형",
    "F_follow_through": "장대양봉 후속관찰형",
    "H_risk_watch": "위험 감시형",
    "I_opening_gap_hold": "시초 갭 유지형",
    "J_morning_high_rebreak": "오전 고점 재돌파형",
    "K_vwap_reclaim": "VWAP 재장악형",
    "M_market_relative_strength": "시장 역행 강세형",
    "N_afternoon_reacceleration": "오후 재가속형",
    "O_limit_up_watch": "상한가 근접 관찰형",
}


@dataclass
class FormulaStats:
    signals: int = 0
    hits: int = 0
    future_return_sum: float = 0.0
    max_drawdown_sum: float = 0.0

    def add(self, hit: bool, future_return: float, max_drawdown: float) -> None:
        self.signals += 1
        self.hits += int(hit)
        self.future_return_sum += future_return
        self.max_drawdown_sum += max_drawdown

    def add_many(self, hits: pd.Series, future_returns: pd.Series, max_drawdowns: pd.Series) -> None:
        self.signals += int(len(hits))
        self.hits += int(hits.sum())
        self.future_return_sum += float(np.nan_to_num(future_returns.to_numpy(dtype=float), nan=0).sum())
        self.max_drawdown_sum += float(np.nan_to_num(max_drawdowns.to_numpy(dtype=float), nan=0).sum())

    def merge(self, other: "FormulaStats") -> None:
        self.signals += other.signals
        self.hits += other.hits
        self.future_return_sum += other.future_return_sum
        self.max_drawdown_sum += other.max_drawdown_sum


def symbol_from_dir(path: Path) -> str:
    match = re.match(r"A(\d{6})", path.name)
    return match.group(1) if match else path.name


def name_from_dir(path: Path) -> str:
    if "_" in path.name:
        return path.name.split("_", 1)[1]
    return symbol_from_dir(path)


def list_symbol_dirs(root: Path) -> list[Path]:
    if not root.exists():
        return []
    dirs = [p for p in root.iterdir() if p.is_dir() and re.match(r"A\d{6}", p.name)]
    return sorted(dirs, key=lambda p: p.name)


def parse_minute_dataframe(raw: pd.DataFrame) -> pd.DataFrame:
    required = {"date", "time", "open", "high", "low", "close", "volume"}
    if raw.empty or not required.issubset(raw.columns):
        return pd.DataFrame()
    df = raw[list(required)].copy()
    df = df.dropna()
    df["date"] = df["date"].astype(int)
    df["time"] = df["time"].astype(int)
    df = df[(df["time"] >= 900) & (df["time"] <= 1530)]
    if df.empty:
        return pd.DataFrame()
    dt = pd.to_datetime(df["date"].astype(str) + df["time"].astype(str).str.zfill(4), format="%Y%m%d%H%M", errors="coerce")
    df = df.assign(datetime=dt).dropna(subset=["datetime"])
    df = df.drop_duplicates(subset=["datetime"]).sort_values("datetime").reset_index(drop=True)
    for col in ["open", "high", "low", "close", "volume"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df = df.dropna(subset=["open", "high", "low", "close", "volume"])
    df = df[(df["close"] > 0) & (df["volume"] >= 0)]
    return df.reset_index(drop=True)


def load_symbol_frame(symbol_dir: Path) -> pd.DataFrame:
    files = sorted(symbol_dir.glob("*.parquet"))
    if not files:
        return pd.DataFrame()
    frames = []
    for file in files:
        try:
            frames.append(pd.read_parquet(file, columns=["date", "time", "open", "high", "low", "close", "volume"]))
        except Exception:
            continue
    if not frames:
        return pd.DataFrame()
    return parse_minute_dataframe(pd.concat(frames, ignore_index=True))


def add_features(df: pd.DataFrame, market_return_by_day: dict[int, float]) -> pd.DataFrame:
    df = df.copy()
    df["amount"] = df["close"] * df["volume"]
    day = df.groupby("date", sort=True)
    daily = day.agg(
        open=("open", "first"),
        high=("high", "max"),
        low=("low", "min"),
        close=("close", "last"),
        volume=("volume", "sum"),
        amount=("amount", "sum"),
    )
    daily["prev_close"] = daily["close"].shift(1)
    daily["prev_high20"] = daily["high"].shift(1).rolling(20, min_periods=10).max()
    daily["prev_low20"] = daily["low"].shift(1).rolling(20, min_periods=10).min()
    daily["avg_volume20"] = daily["volume"].shift(1).rolling(20, min_periods=10).mean()
    daily["avg_amount20"] = daily["amount"].shift(1).rolling(20, min_periods=10).mean()
    daily["ma5"] = daily["close"].shift(1).rolling(5, min_periods=3).mean()
    daily["prev3_high"] = daily["high"].shift(1).rolling(3, min_periods=2).max()
    daily["prev_change_pct"] = (daily["close"].shift(1) / daily["close"].shift(2) - 1) * 100
    daily["prev_volume_ratio20"] = daily["volume"].shift(1) / daily["avg_volume20"]
    daily["box_range_pct"] = (daily["prev_high20"] - daily["prev_low20"]) / daily["prev_close"] * 100

    df = df.join(daily[["prev_close", "prev_high20", "prev_low20", "avg_volume20", "avg_amount20", "ma5", "prev3_high", "prev_change_pct", "prev_volume_ratio20", "box_range_pct"]], on="date")
    df["cum_volume"] = day["volume"].cumsum()
    df["cum_amount"] = day["amount"].cumsum()
    df["cum_high"] = day["high"].cummax()
    df["cum_low"] = day["low"].cummin()
    df["vwap"] = day["amount"].cumsum() / df["cum_volume"].replace(0, np.nan)
    df["change_pct"] = (df["close"] / df["prev_close"] - 1) * 100
    df["gap_pct"] = (df.groupby("date")["open"].transform("first") / df["prev_close"] - 1) * 100
    df["distance_prev_high_pct"] = (df["prev_high20"] - df["close"]) / df["prev_high20"] * 100
    df["box_breakout"] = (df["close"] > df["prev_high20"]) & (df["box_range_pct"] <= 12)
    df["intraday_range_pct"] = (df["cum_high"] - df["cum_low"]) / df["close"] * 100
    df["close_to_high_pct"] = df["close"] / df["cum_high"] * 100
    df["is_above_vwap"] = df["close"] >= df["vwap"]
    df["is_above_ma5"] = df["close"] >= df["ma5"]
    df["minute_index"] = day.cumcount() + 1

    # Expected full-day ratios based on elapsed minutes. This is a practical
    # time-adjusted proxy when same-minute 20-day cumulative history is sparse.
    elapsed = df["minute_index"].clip(lower=1)
    df["expected_volume_ratio"] = (df["cum_volume"] / elapsed * 390) / df["avg_volume20"]
    df["expected_amount_ratio"] = (df["cum_amount"] / elapsed * 390) / df["avg_amount20"]

    morning = df[df["time"] <= 1030].groupby("date")["high"].max()
    df["morning_high"] = df["date"].map(morning)
    df["morning_high_rebreak"] = (df["time"] > 1030) & (df["close"] > df["morning_high"])
    morning_change = df[df["time"] <= 1100].groupby("date")["change_pct"].max()
    lunch_high = df[(df["time"] >= 1100) & (df["time"] <= 1330)].groupby("date")["high"].max()
    df["morning_max_change"] = df["date"].map(morning_change)
    df["lunch_high"] = df["date"].map(lunch_high)
    df["afternoon_reacceleration"] = (df["time"] >= 1300) & (df["morning_max_change"] >= 3) & (df["close"] > df["lunch_high"]) & df["is_above_vwap"]

    rolling20 = day["close"].rolling(20, min_periods=5).mean().reset_index(level=0, drop=True)
    rolling5vol = day["volume"].rolling(5, min_periods=3).mean().reset_index(level=0, drop=True)
    df["minute_ma20"] = rolling20
    df["bar_volume_ratio5"] = df["volume"] / rolling5vol.replace(0, np.nan)
    below_vwap_seen = (df["close"] < df["vwap"]).groupby(df["date"]).cummax()
    df["vwap_reclaim"] = below_vwap_seen & (df["close"] > df["vwap"]) & (df["close"] > df["minute_ma20"])

    pullback_depth = (df["close"] / df["prev_high20"] - 1) * 100
    df["pullback_depth_pct"] = pullback_depth.where(pullback_depth < 0, 0)
    df["market_return_pct"] = df["date"].map(market_return_by_day).fillna(0)
    df["relative_strength_pct"] = df["change_pct"] - df["market_return_pct"]
    return df.replace([np.inf, -np.inf], np.nan)


def future_metrics(df: pd.DataFrame, horizon: int) -> pd.DataFrame:
    df = df.copy()
    future_high = df.groupby("date", group_keys=False)["high"].apply(lambda s: s.shift(-1).iloc[::-1].rolling(horizon, min_periods=1).max().iloc[::-1])
    future_low = df.groupby("date", group_keys=False)["low"].apply(lambda s: s.shift(-1).iloc[::-1].rolling(horizon, min_periods=1).min().iloc[::-1])
    df["future_max_return_pct"] = (future_high / df["close"] - 1) * 100
    df["future_max_drawdown_pct"] = (future_low / df["close"] - 1) * 100
    return df


def formula_masks(df: pd.DataFrame, min_amount: float) -> dict[str, pd.Series]:
    amount_ok = df["cum_amount"] >= min_amount
    vol = df["expected_volume_ratio"].fillna(0)
    amt = df["expected_amount_ratio"].fillna(0)
    chg = df["change_pct"].fillna(-999)
    masks = {
        "A_volume_spike": (vol >= 2.5) & (amt >= 2.0) & (chg >= 2) & df["is_above_vwap"] & amount_ok,
        "B_prev_high_approach": (df["distance_prev_high_pct"].between(0, 3)) & (vol >= 1.5) & (chg > 0) & df["is_above_ma5"],
        "C_new_high_breakout": (df["close"] > df["prev_high20"]) & (vol >= 1.5) & amount_ok & df["is_above_vwap"],
        "D_box_breakout": df["box_breakout"] & (vol >= 1.8) & df["is_above_vwap"],
        "E_pullback_rebreak": df["pullback_depth_pct"].between(-15, -5) & df["is_above_ma5"] & (df["close"] > df["prev3_high"]) & (vol >= 1.5) & df["is_above_vwap"],
        "F_follow_through": (df["prev_change_pct"] >= 8) & (df["prev_volume_ratio20"] >= 3) & (df["close"] >= df["prev_close"] * 0.97) & df["is_above_vwap"] & (vol >= 1.2),
        "H_risk_watch": (chg > 15) | (vol > 5) | (df["intraday_range_pct"] > 12) | (df["gap_pct"] > 10),
        "I_opening_gap_hold": (df["gap_pct"] >= 3) & (df["close"] >= df.groupby("date")["open"].transform("first") * 0.99) & df["is_above_vwap"] & (vol >= 2) & amount_ok,
        "J_morning_high_rebreak": df["morning_high_rebreak"] & (vol >= 1.8) & df["is_above_vwap"],
        "K_vwap_reclaim": df["vwap_reclaim"] & (df["bar_volume_ratio5"] >= 1.5) & (chg > 0),
        "M_market_relative_strength": (df["market_return_pct"] <= 0) & (chg >= 3) & (df["relative_strength_pct"] >= 4) & (vol >= 1.5),
        "N_afternoon_reacceleration": df["afternoon_reacceleration"] & (vol >= 1.3),
        "O_limit_up_watch": (chg >= 25) & (df["close_to_high_pct"] >= 99) & (vol >= 3),
    }
    return masks


def cooldown_indices(mask: pd.Series, df: pd.DataFrame, cooldown: int) -> list[int]:
    picked: list[int] = []
    last_by_day: dict[int, int] = {}
    for idx in mask[mask.fillna(False)].index:
        date = int(df.at[idx, "date"])
        minute_index = int(df.at[idx, "minute_index"])
        if minute_index - last_by_day.get(date, -10_000) >= cooldown:
            picked.append(idx)
            last_by_day[date] = minute_index
    return picked


def market_returns(symbol_dirs: list[Path], max_symbols: int | None) -> dict[int, float]:
    rows = []
    for symbol_dir in symbol_dirs[: max_symbols or len(symbol_dirs)]:
        df = load_symbol_frame(symbol_dir)
        if df.empty:
            continue
        daily = df.groupby("date").agg(open=("open", "first"), close=("close", "last"), amount=("volume", "sum"))
        daily["return"] = (daily["close"] / daily["open"] - 1) * 100
        rows.append(daily[["return"]])
    if not rows:
        return {}
    merged = pd.concat(rows)
    return merged.groupby(level=0)["return"].mean().to_dict()


def process_symbol_dir(
    market_name: str,
    symbol_dir_str: str,
    market_return_by_day: dict[int, float],
    surge_pct: float,
    horizon_bars: int,
    cooldown_bars: int,
    min_amount: float,
) -> dict[str, Any]:
    symbol_dir = Path(symbol_dir_str)
    df = load_symbol_frame(symbol_dir)
    if df.empty or len(df) < 500:
        return {"processed": 0, "skipped": 1, "baselineTotal": 0, "baselineHits": 0, "stats": {}, "examples": []}

    df = future_metrics(add_features(df, market_return_by_day), horizon_bars)
    eligible = (df["cum_amount"] >= min_amount) & df["future_max_return_pct"].notna() & df["prev_close"].notna()
    baseline_total = int(eligible.sum())
    baseline_hits = int((eligible & (df["future_max_return_pct"] >= surge_pct)).sum())
    masks = formula_masks(df, min_amount)
    symbol = symbol_from_dir(symbol_dir)
    display_name = name_from_dir(symbol_dir)
    stats: dict[str, FormulaStats] = defaultdict(FormulaStats)
    examples: list[dict[str, Any]] = []

    for key, mask in masks.items():
        picked = cooldown_indices(mask & eligible, df, cooldown_bars)
        if not picked:
            continue
        picked_df = df.loc[picked]
        hits = picked_df["future_max_return_pct"] >= surge_pct
        stats[key].add_many(hits, picked_df["future_max_return_pct"], picked_df["future_max_drawdown_pct"])
        if len(examples) < 5:
            example_df = picked_df.head(5 - len(examples))
            example_hits = hits.loc[example_df.index]
            for (_, row), hit in zip(example_df.iterrows(), example_hits):
                examples.append(
                    {
                        "market": market_name,
                        "symbol": symbol,
                        "name": display_name,
                        "formulaKey": key,
                        "formulaName": FORMULA_NAMES.get(key, key),
                        "datetime": str(row["datetime"]),
                        "close": float(row["close"]),
                        "futureMaxReturnPct": round(float(row["future_max_return_pct"]), 2),
                        "hit": bool(hit),
                        "volumeRatio": round(float(row["expected_volume_ratio"]), 2) if not math.isnan(row["expected_volume_ratio"]) else None,
                        "amountRatio": round(float(row["expected_amount_ratio"]), 2) if not math.isnan(row["expected_amount_ratio"]) else None,
                    }
                )

    return {
        "processed": 1,
        "skipped": 0,
        "baselineTotal": baseline_total,
        "baselineHits": baseline_hits,
        "stats": dict(stats),
        "examples": examples,
    }


def summarize(stats: dict[str, FormulaStats], baseline_hits: int, baseline_total: int) -> dict[str, Any]:
    baseline_rate = baseline_hits / baseline_total if baseline_total else 0
    formulas = []
    for key, item in sorted(stats.items()):
        hit_rate = item.hits / item.signals if item.signals else 0
        formulas.append(
            {
                "formulaKey": key,
                "formulaName": FORMULA_NAMES.get(key, key),
                "signals": item.signals,
                "hits": item.hits,
                "hitRate": round(hit_rate, 4),
                "baselineHitRate": round(baseline_rate, 4),
                "liftVsBaseline": round(hit_rate / baseline_rate, 2) if baseline_rate else None,
                "avgFutureMaxReturnPct": round(item.future_return_sum / item.signals, 3) if item.signals else None,
                "avgFutureMaxDrawdownPct": round(item.max_drawdown_sum / item.signals, 3) if item.signals else None,
            }
        )
    total_signals = sum(item.signals for item in stats.values())
    total_hits = sum(item.hits for item in stats.values())
    overall_rate = total_hits / total_signals if total_signals else 0
    return {
        "baseline": {
            "eligibleMinutes": baseline_total,
            "hits": baseline_hits,
            "hitRate": round(baseline_rate, 4),
        },
        "overallSignals": {
            "signals": total_signals,
            "hits": total_hits,
            "hitRate": round(overall_rate, 4),
            "liftVsBaseline": round(overall_rate / baseline_rate, 2) if baseline_rate else None,
        },
        "formulas": formulas,
    }


def run_market(name: str, root: Path, args: argparse.Namespace) -> dict[str, Any]:
    symbol_dirs = list_symbol_dirs(root)
    total_discovered = len(symbol_dirs)
    if args.skip_symbols:
        symbol_dirs = symbol_dirs[args.skip_symbols :]
    if args.max_symbols:
        symbol_dirs = symbol_dirs[: args.max_symbols]
    market_return_by_day = market_returns(symbol_dirs, args.market_return_symbols) if args.market_return_symbols else {}
    stats: dict[str, FormulaStats] = defaultdict(FormulaStats)
    baseline_total = 0
    baseline_hits = 0
    processed = 0
    skipped = 0
    examples: list[dict[str, Any]] = []

    def merge_result(result: dict[str, Any]) -> None:
        nonlocal baseline_total, baseline_hits, processed, skipped, examples
        processed += int(result["processed"])
        skipped += int(result["skipped"])
        baseline_total += int(result["baselineTotal"])
        baseline_hits += int(result["baselineHits"])
        for key, item in result["stats"].items():
            stats[key].merge(item)
        if len(examples) < 30:
            examples.extend(result["examples"][: 30 - len(examples)])

    if args.workers <= 1:
        for symbol_dir in symbol_dirs:
            result = process_symbol_dir(
                name,
                str(symbol_dir),
                market_return_by_day,
                args.surge_pct,
                args.horizon_bars,
                args.cooldown_bars,
                args.min_amount,
            )
            merge_result(result)
            if args.progress_every and (processed + skipped) % args.progress_every == 0:
                print(json.dumps({"market": name, "completed": processed + skipped, "processed": processed, "skipped": skipped, "baselineMinutes": baseline_total, "signals": sum(s.signals for s in stats.values())}, ensure_ascii=False), flush=True)
    else:
        with ProcessPoolExecutor(max_workers=args.workers) as executor:
            futures = [
                executor.submit(
                    process_symbol_dir,
                    name,
                    str(symbol_dir),
                    market_return_by_day,
                    args.surge_pct,
                    args.horizon_bars,
                    args.cooldown_bars,
                    args.min_amount,
                )
                for symbol_dir in symbol_dirs
            ]
            completed = 0
            for future in as_completed(futures):
                merge_result(future.result())
                completed += 1
                if args.progress_every and completed % args.progress_every == 0:
                    print(json.dumps({"market": name, "completed": completed, "processed": processed, "skipped": skipped, "baselineMinutes": baseline_total, "signals": sum(s.signals for s in stats.values())}, ensure_ascii=False), flush=True)

    return {
        "market": name,
        "root": str(root),
        "symbolsDiscovered": total_discovered,
        "symbolsSkippedByOffset": args.skip_symbols,
        "symbolsSelectedForRun": len(symbol_dirs),
        "symbolsProcessed": processed,
        "symbolsSkipped": skipped,
        **summarize(stats, baseline_hits, baseline_total),
        "examples": examples,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--kospi-root", default="A_kospi_1m_parquet/output_parquet/1m")
    parser.add_argument("--kosdaq-root", default="B_kosdaq_1m_parquet/output_parquet_kosdaq/1m")
    parser.add_argument("--markets", default="both", choices=["both", "kospi", "kosdaq"], help="which market dataset to run")
    parser.add_argument("--out", default="public/data/kr-1m-formula-backtest.json")
    parser.add_argument("--surge-pct", type=float, default=3.0)
    parser.add_argument("--horizon-bars", type=int, default=120)
    parser.add_argument("--cooldown-bars", type=int, default=30)
    parser.add_argument("--min-amount", type=float, default=2_000_000_000)
    parser.add_argument("--skip-symbols", type=int, default=0, help="skip this many sorted symbol directories per market before running")
    parser.add_argument("--max-symbols", type=int, default=0, help="0 means all symbols")
    parser.add_argument("--market-return-symbols", type=int, default=200, help="sample size for market relative-strength baseline; 0 disables it")
    parser.add_argument("--workers", type=int, default=1, help="parallel worker processes for per-symbol backtests")
    parser.add_argument("--progress-every", type=int, default=250)
    args = parser.parse_args()
    if args.max_symbols <= 0:
        args.max_symbols = None
    if args.skip_symbols < 0:
        args.skip_symbols = 0
    if args.workers < 1:
        args.workers = 1

    started = datetime.now(timezone.utc)
    markets = []
    if args.markets in ("both", "kospi"):
        markets.append(run_market("KOSPI", Path(args.kospi_root), args))
    if args.markets in ("both", "kosdaq"):
        markets.append(run_market("KOSDAQ", Path(args.kosdaq_root), args))
    total_baseline = sum(m["baseline"]["eligibleMinutes"] for m in markets)
    total_hits = sum(m["baseline"]["hits"] for m in markets)
    total_signals = sum(m["overallSignals"]["signals"] for m in markets)
    total_signal_hits = sum(m["overallSignals"]["hits"] for m in markets)
    baseline_rate = total_hits / total_baseline if total_baseline else 0
    signal_rate = total_signal_hits / total_signals if total_signals else 0
    payload = {
        "ok": True,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "runtimeSeconds": round((datetime.now(timezone.utc) - started).total_seconds(), 2),
        "parameters": {
            "surgePct": args.surge_pct,
            "horizonBars": args.horizon_bars,
            "cooldownBars": args.cooldown_bars,
            "minAmount": args.min_amount,
            "skipSymbols": args.skip_symbols,
            "maxSymbols": args.max_symbols,
            "workers": args.workers,
            "targetDefinition": f"signal close 이후 {args.horizon_bars}개 1분봉 내 고가 +{args.surge_pct}% 이상",
        },
        "combined": {
            "baseline": {"eligibleMinutes": total_baseline, "hits": total_hits, "hitRate": round(baseline_rate, 4)},
            "signals": {"signals": total_signals, "hits": total_signal_hits, "hitRate": round(signal_rate, 4), "liftVsBaseline": round(signal_rate / baseline_rate, 2) if baseline_rate else None},
        },
        "markets": markets,
    }
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"ok": True, "out": str(out), "combined": payload["combined"], "runtimeSeconds": payload["runtimeSeconds"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
