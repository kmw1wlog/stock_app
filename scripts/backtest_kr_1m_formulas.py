#!/usr/bin/env python3
"""Shared KR 1-minute formula helpers for runtime and backtests.

The original helper module was missing from the repository. This version
restores the interface that the runtime and backtest scripts expect while
keeping the feature engineering deterministic and lightweight.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import pandas as pd


FORMULA_NAMES = {
    "A_volume_spike": "거래량 폭발형",
    "B_prev_high_approach": "전고점 접근형",
    "C_new_high_breakout": "신고가 돌파형",
    "D_box_breakout": "박스권 상단 돌파형",
    "E_pullback_rebreak": "눌림목 재돌파형",
    "F_follow_through": "장대양봉 후속관찰형",
    "H_risk_watch": "위험 감시형",
    "I_opening_gap_hold": "시초 갭 유지형",
    "J_morning_high_rebreak": "오전 고점 재돌파형",
    "K_vwap_reclaim": "VWAP 재장악형",
    "M_market_relative_strength": "시장 역행 강세형",
    "N_afternoon_reacceleration": "오후 재가속형",
    "O_limit_up_watch": "상한가 근접 감시형",
}


@dataclass
class FormulaStats:
    signals: int = 0
    hits: int = 0
    future_return_sum: float = 0.0
    max_drawdown_sum: float = 0.0

    def add_many(
        self,
        hits: Iterable[bool],
        future_returns: Iterable[float],
        future_drawdowns: Iterable[float],
    ) -> None:
        for hit, future_return, future_drawdown in zip(hits, future_returns, future_drawdowns):
            self.signals += 1
            self.hits += int(bool(hit))
            self.future_return_sum += float(future_return)
            self.max_drawdown_sum += float(future_drawdown)


def symbol_from_dir(path: Path) -> str:
    return "".join(ch for ch in path.stem if ch.isdigit()).zfill(6)


def list_symbol_dirs(root: Path) -> list[Path]:
    if not root.exists():
        return []
    paths = [path for path in root.iterdir() if path.is_dir() or path.suffix == ".parquet"]
    return sorted(paths, key=lambda path: path.name)


def _rename_first(frame: pd.DataFrame, target: str, aliases: list[str]) -> None:
    for alias in aliases:
        if alias in frame.columns:
            if alias != target:
                frame.rename(columns={alias: target}, inplace=True)
            return


def _normalize_symbol_frame(frame: pd.DataFrame) -> pd.DataFrame:
    frame = frame.copy()
    _rename_first(frame, "date", ["date", "trd_date", "trade_date"])
    _rename_first(frame, "time", ["time", "trd_time", "trade_time"])
    _rename_first(frame, "open", ["open", "open_price", "stck_oprc"])
    _rename_first(frame, "high", ["high", "high_price", "stck_hgpr"])
    _rename_first(frame, "low", ["low", "low_price", "stck_lwpr"])
    _rename_first(frame, "close", ["close", "price", "close_price", "stck_prpr"])
    _rename_first(frame, "volume", ["volume", "vol", "cntg_vol", "acml_vol"])

    if "bar_time_kst" in frame.columns:
        dt = pd.to_datetime(frame["bar_time_kst"], errors="coerce")
        frame["date"] = dt.dt.strftime("%Y%m%d")
        frame["time"] = dt.dt.strftime("%H%M")

    required = ["date", "time", "open", "high", "low", "close", "volume"]
    missing = [col for col in required if col not in frame.columns]
    if missing:
        raise ValueError(f"missing required minute columns: {missing}")

    frame["date"] = pd.to_numeric(frame["date"], errors="coerce").astype("Int64")
    frame["time"] = pd.to_numeric(frame["time"], errors="coerce").astype("Int64")
    for col in ["open", "high", "low", "close", "volume"]:
        frame[col] = pd.to_numeric(frame[col], errors="coerce")

    frame = frame.dropna(subset=["date", "time", "open", "high", "low", "close", "volume"]).copy()
    frame["date"] = frame["date"].astype(int)
    frame["time"] = frame["time"].astype(int)
    return frame.sort_values(["date", "time"]).reset_index(drop=True)


def load_symbol_frame(symbol_dir: Path) -> pd.DataFrame:
    if symbol_dir.is_file():
        files = [symbol_dir]
    else:
        files = sorted(symbol_dir.glob("*.parquet"))
    if not files:
        return pd.DataFrame(columns=["date", "time", "open", "high", "low", "close", "volume"])
    frames = [pd.read_parquet(file) for file in files]
    return _normalize_symbol_frame(pd.concat(frames, ignore_index=True))


def _rolling_same_minute_baseline(series: pd.Series, minute_index: pd.Series) -> pd.Series:
    return (
        series.groupby(minute_index)
        .transform(lambda values: values.shift(1).rolling(20, min_periods=1).mean())
        .astype(float)
    )


def add_features(frame: pd.DataFrame, market_returns: dict[int, float] | None) -> pd.DataFrame:
    if frame.empty:
        return frame.copy()

    df = frame.copy()
    df = df.sort_values(["date", "time"]).reset_index(drop=True)
    for col in ["open", "high", "low", "close", "volume"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df["minute_index"] = df.groupby("date").cumcount()
    df["amount"] = df["close"] * df["volume"]
    df["cum_volume"] = df.groupby("date")["volume"].cumsum()
    df["cum_amount"] = df.groupby("date")["amount"].cumsum()

    minute_baseline_volume = _rolling_same_minute_baseline(df["cum_volume"], df["minute_index"])
    minute_baseline_amount = _rolling_same_minute_baseline(df["cum_amount"], df["minute_index"])
    df["expected_volume_ratio"] = (df["cum_volume"] / minute_baseline_volume).where(minute_baseline_volume > 0, 0.0).fillna(0.0)
    df["expected_amount_ratio"] = (df["cum_amount"] / minute_baseline_amount).where(minute_baseline_amount > 0, 0.0).fillna(0.0)

    daily = (
        df.groupby("date", as_index=False)
        .agg(
            day_open=("open", "first"),
            day_high=("high", "max"),
            day_low=("low", "min"),
            day_close=("close", "last"),
            day_volume=("volume", "sum"),
            day_amount=("amount", "sum"),
        )
        .sort_values("date")
        .reset_index(drop=True)
    )
    daily["daily_change_pct"] = daily["day_close"].pct_change().mul(100.0)
    daily["daily_volume_avg20"] = daily["day_volume"].shift(1).rolling(20, min_periods=1).mean()
    daily["daily_high20"] = daily["day_high"].shift(1).rolling(20, min_periods=1).max()
    daily["daily_low20"] = daily["day_low"].shift(1).rolling(20, min_periods=1).min()
    daily["prev_close"] = daily["day_close"].shift(1)
    daily["prev_change_pct"] = daily["daily_change_pct"].shift(1)
    daily["prev_volume_ratio20"] = (daily["day_volume"] / daily["daily_volume_avg20"]).where(daily["daily_volume_avg20"] > 0)
    daily["gap_pct"] = ((daily["day_open"] - daily["prev_close"]) / daily["prev_close"] * 100.0).where(daily["prev_close"] > 0)

    df = df.merge(
        daily[
            [
                "date",
                "day_open",
                "day_high",
                "day_low",
                "prev_close",
                "prev_change_pct",
                "prev_volume_ratio20",
                "daily_high20",
                "daily_low20",
                "gap_pct",
            ]
        ],
        on="date",
        how="left",
    )

    df["change_pct"] = ((df["close"] - df["prev_close"]) / df["prev_close"] * 100.0).where(df["prev_close"] > 0)
    fallback_change = ((df["close"] - df["day_open"]) / df["day_open"] * 100.0).where(df["day_open"] > 0)
    df["change_pct"] = df["change_pct"].fillna(fallback_change).fillna(0.0)

    df["distance_prev_high_pct"] = ((df["daily_high20"] - df["close"]) / df["daily_high20"] * 100.0).where(df["daily_high20"] > 0)
    df["box_range_pct"] = ((df["daily_high20"] - df["daily_low20"]) / df["daily_low20"] * 100.0).where(df["daily_low20"] > 0)
    df["box_breakout"] = (df["close"] > df["daily_high20"]) & (df["daily_high20"].notna())

    intraday_high = df.groupby("date")["high"].cummax()
    intraday_low = df.groupby("date")["low"].cummin()
    range_base = intraday_high - intraday_low
    df["close_to_high_pct"] = ((df["close"] - intraday_low) / range_base * 100.0).where(range_base > 0, 100.0).fillna(100.0)
    df["intraday_range_pct"] = ((intraday_high - intraday_low) / intraday_low * 100.0).where(intraday_low > 0).fillna(0.0)

    ma5 = df.groupby("date")["close"].transform(lambda values: values.rolling(5, min_periods=1).mean())
    df["is_above_ma5"] = df["close"] >= ma5
    df["vwap"] = (df["cum_amount"] / df["cum_volume"]).where(df["cum_volume"] > 0)
    df["is_above_vwap"] = df["close"] >= df["vwap"]
    prev_close_bar = df.groupby("date")["close"].shift(1)
    prev_vwap = df.groupby("date")["vwap"].shift(1)
    df["vwap_reclaim"] = (prev_close_bar < prev_vwap) & (df["close"] >= df["vwap"])

    rolling_bar_mean5 = df.groupby("date")["volume"].transform(lambda values: values.shift(1).rolling(5, min_periods=1).mean())
    df["bar_volume_ratio5"] = (df["volume"] / rolling_bar_mean5).where(rolling_bar_mean5 > 0).fillna(0.0)

    morning_high = (
        df[df["minute_index"] < 5]
        .groupby("date")["high"]
        .max()
        .rename("morning_high")
    )
    df = df.merge(morning_high, on="date", how="left")
    df["morning_high_rebreak"] = (
        (df["minute_index"] >= 5)
        & (prev_close_bar <= df["morning_high"])
        & (df["close"] > df["morning_high"])
    )

    trailing_close_max3 = df.groupby("date")["close"].transform(lambda values: values.shift(1).rolling(3, min_periods=1).max())
    trailing_change_min3 = df.groupby("date")["change_pct"].transform(lambda values: values.shift(1).rolling(3, min_periods=1).min())
    df["afternoon_reacceleration"] = (
        (df["minute_index"] >= 5)
        & (df["close"] > trailing_close_max3)
        & (df["change_pct"] > trailing_change_min3 + 1.0)
    )

    df["pullback_depth_pct"] = ((df["close"] - df["daily_high20"]) / df["daily_high20"] * 100.0).where(df["daily_high20"] > 0)
    market_series = pd.Series(market_returns or {}, dtype=float)
    df["market_return_pct"] = df["date"].map(market_series).fillna(0.0)
    df["relative_strength_pct"] = df["change_pct"] - df["market_return_pct"]
    return df


def formula_masks(df: pd.DataFrame, min_amount: float) -> dict[str, pd.Series]:
    enough_amount = df["cum_amount"] >= float(min_amount)
    expected_vol = df["expected_volume_ratio"]
    expected_amt = df["expected_amount_ratio"]
    change = df["change_pct"]
    rel = df["relative_strength_pct"]

    masks = {
        "A_volume_spike": enough_amount & (expected_vol >= 2.0) & (expected_amt >= 1.5) & (change >= 0.0),
        "B_prev_high_approach": enough_amount & df["distance_prev_high_pct"].between(0.0, 3.0, inclusive="both") & (expected_vol >= 1.2),
        "C_new_high_breakout": enough_amount & (df["distance_prev_high_pct"] < 0.0) & (expected_vol >= 1.5) & (expected_amt >= 1.2),
        "D_box_breakout": enough_amount & df["box_breakout"] & (expected_vol >= 1.5),
        "E_pullback_rebreak": enough_amount & df["pullback_depth_pct"].between(-15.0, -3.0, inclusive="both") & df["is_above_vwap"] & (expected_vol >= 1.2),
        "F_follow_through": enough_amount & (df["prev_change_pct"] >= 8.0) & (df["prev_volume_ratio20"] >= 3.0) & (expected_vol >= 1.2) & (change >= -3.0),
        "H_risk_watch": enough_amount & ((change >= 8.0) | (df["intraday_range_pct"] >= 10.0)) & (expected_vol >= 3.0),
        "I_opening_gap_hold": enough_amount & (df["gap_pct"] >= 3.0) & df["is_above_vwap"] & (expected_vol >= 1.5),
        "J_morning_high_rebreak": enough_amount & df["morning_high_rebreak"] & (expected_vol >= 1.5),
        "K_vwap_reclaim": enough_amount & df["vwap_reclaim"] & (df["bar_volume_ratio5"] >= 1.2),
        "M_market_relative_strength": enough_amount & (rel >= 4.0) & (expected_vol >= 1.5) & (change >= 1.0),
        "N_afternoon_reacceleration": enough_amount & df["afternoon_reacceleration"] & (expected_vol >= 1.2),
        "O_limit_up_watch": enough_amount & (change >= 25.0) & (df["close_to_high_pct"] >= 99.0),
    }
    return {key: series.fillna(False) for key, series in masks.items()}


def cooldown_indices(mask: pd.Series, df: pd.DataFrame, cooldown_bars: int) -> list[int]:
    if len(mask) != len(df):
        raise ValueError("mask and frame length mismatch")
    cooldown = max(int(cooldown_bars), 0)
    accepted: list[int] = []
    last_idx_by_date: dict[int, int] = {}

    for idx, is_hit in zip(df.index.tolist(), mask.astype(bool).tolist()):
        if not is_hit:
            continue
        date = int(df.at[idx, "date"])
        minute_index = int(df.at[idx, "minute_index"])
        last_minute_index = last_idx_by_date.get(date)
        if last_minute_index is not None and minute_index - last_minute_index <= cooldown:
            continue
        accepted.append(idx)
        last_idx_by_date[date] = minute_index
    return accepted


def future_metrics(df: pd.DataFrame, horizon_bars: int) -> pd.DataFrame:
    if df.empty:
        return df.copy()
    horizon = max(int(horizon_bars), 1)
    out = df.copy()
    out["future_max_return_pct"] = pd.NA
    out["future_max_drawdown_pct"] = pd.NA

    for _, group_index in out.groupby("date").groups.items():
        indices = list(group_index)
        highs = out.loc[indices, "high"].tolist()
        lows = out.loc[indices, "low"].tolist()
        closes = out.loc[indices, "close"].tolist()
        for position, idx in enumerate(indices):
            close = float(closes[position])
            if close <= 0:
                continue
            future_slice = slice(position + 1, min(len(indices), position + 1 + horizon))
            future_highs = highs[future_slice]
            future_lows = lows[future_slice]
            if not future_highs or not future_lows:
                continue
            out.at[idx, "future_max_return_pct"] = (max(future_highs) - close) / close * 100.0
            out.at[idx, "future_max_drawdown_pct"] = (min(future_lows) - close) / close * 100.0
    return out
