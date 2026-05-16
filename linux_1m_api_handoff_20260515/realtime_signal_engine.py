#!/usr/bin/env python3
"""Realtime stock-selector + minute-formula alert pipeline for KR stocks.

This runtime bridges three parts that already existed separately:
1. Cross-sectional daily stock selection with disclosure features.
2. KIS 1-minute bar polling on Linux.
3. Minute-level formula evaluation and alert trigger generation.

Design:
- `build-selector`: compute today's selected symbols once and cache them.
- `run-once`: fetch minute bars from KIS or a fixture, evaluate formula signals,
  and write alert-ready outbox payloads.
- `loop`: repeat `run-once` every N seconds.

The runtime is JSON-outbox first so it can be tested without Node/Prisma in this
environment, while keeping payloads close to the existing backend schema.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import sys
import time
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Iterable

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from linux_1m_api_handoff_20260515.kis_linux_1m_poller import (  # noqa: E402
    KST,
    KisMinutePoller,
    build_config as build_kis_config,
    load_env_file,
    now_kst,
)
from scripts.backtest_kr_1m_formulas import (  # noqa: E402
    FORMULA_NAMES,
    add_features,
    cooldown_indices,
    formula_masks,
)
from scripts.backtest_kosdaq_horizontal_disclosures import (  # noqa: E402
    add_cross_sectional_scores,
    add_disclosure_features,
    add_price_features,
    aggregate_disclosure_daily,
    assign_trade_dates,
    classify_receipts,
    load_daily_history,
    load_receipt_times,
    load_receipts,
)


DEFAULT_OUT_DIR = ROOT / "runtime_output" / "realtime_signals"


@dataclass
class SelectorCandidate:
    symbol: str
    name: str
    date: str
    market: str
    market_label: str
    theme: str | None
    ggroup: str | None
    gind: str | None
    selector_score: float
    reasons: list[str]
    features: dict[str, float]


@dataclass
class FormulaSignalPayload:
    symbol: str
    name: str
    market: str
    market_label: str
    theme: str | None
    formula_key: str
    formula_name: str
    triggered_at: str
    fit_score: float
    alert_line: str
    matched_reasons: list[str]
    risk_tags: list[str]
    latest_bar: dict[str, Any]
    technical_snapshot: dict[str, Any] | None = None
    selector_score: float | None = None
    selector_reasons: list[str] | None = None


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def trade_day_from_target(target_date: str | None) -> pd.Timestamp:
    if target_date:
        return pd.Timestamp(target_date).tz_localize(None)
    return pd.Timestamp(now_kst().date())


def selector_reason_strings(row: pd.Series) -> list[str]:
    reasons: list[str] = []
    volume_ratio20 = float(row.get("volume_ratio20") or 0.0)
    dollar_volume_ratio20 = float(row.get("dollar_volume_ratio20") or 0.0)
    turnover_ratio20 = float(row.get("turnover_ratio20") or 0.0)
    close_to_prev_high = float(row.get("close_to_prev_20d_high") or 0.0) * 100
    receipt_burst_7d = float(row.get("receipt_burst_7d") or 0.0)
    irregular_burst_14d = float(row.get("irregular_burst_14d") or 0.0)
    mezzanine_burst_30d = float(row.get("mezzanine_burst_30d") or 0.0)

    if volume_ratio20 > 1.2:
        reasons.append(f"일봉 거래량 {volume_ratio20:.1f}배")
    if dollar_volume_ratio20 > 1.2:
        reasons.append(f"거래대금 {dollar_volume_ratio20:.1f}배")
    if turnover_ratio20 > 1.2:
        reasons.append(f"회전율 {turnover_ratio20:.1f}배")
    if close_to_prev_high > -5:
        reasons.append(f"20일 고점 {abs(close_to_prev_high):.1f}% 거리")
    if receipt_burst_7d > 1.2:
        reasons.append(f"공시 증가 {receipt_burst_7d:.1f}배")
    if irregular_burst_14d > 1.1:
        reasons.append(f"부정기 공시 증가 {irregular_burst_14d:.1f}배")
    if mezzanine_burst_30d > 1.1:
        reasons.append(f"메자닌 공시 증가 {mezzanine_burst_30d:.1f}배")
    return reasons[:4]


def build_selector_snapshot(
    selector: str,
    top_k: int,
    start_date: str,
    target_date: str | None,
) -> dict[str, Any]:
    daily = load_daily_history(start_date)
    if daily.empty:
        raise RuntimeError("no daily history loaded")
    trading_dates = pd.DatetimeIndex(sorted(daily["date"].drop_duplicates().tolist()))
    target_day = trade_day_from_target(target_date)
    eligible_trade_dates = trading_dates[trading_dates <= target_day]
    if len(eligible_trade_dates) == 0:
        raise RuntimeError(f"no trading date <= {target_day.date()}")
    trade_date = pd.Timestamp(eligible_trade_dates[-1]).tz_localize(None)

    receipts, _ = load_receipts()
    times, _ = load_receipt_times()
    if not times.empty:
        receipts = receipts.merge(times[["rcept_no", "receipt_time"]], on="rcept_no", how="left")
    else:
        receipts["receipt_time"] = pd.NA
    receipts = classify_receipts(receipts)
    receipts = assign_trade_dates(receipts, trading_dates)
    disclosure_daily = aggregate_disclosure_daily(receipts)
    corp_name_map = (
        receipts.dropna(subset=["stock_code", "corp_name"])
        .sort_values(["stock_code", "rcept_date"])
        .drop_duplicates(subset=["stock_code"], keep="last")
        .set_index("stock_code")["corp_name"]
        .astype(str)
        .to_dict()
    )

    frame = daily.merge(disclosure_daily, on=["stock_code", "date"], how="left")
    for col in ["receipt_count_1d", "irregular_count_1d", "mezzanine_count_1d"]:
        frame[col] = frame[col].fillna(0.0)
    frame = add_price_features(frame)
    frame = add_disclosure_features(frame)
    frame = add_cross_sectional_scores(frame)

    day_frame = (
        frame[(frame["date"] == trade_date) & frame[selector].notna()]
        .sort_values(selector, ascending=False)
        .head(top_k)
        .copy()
    )
    if day_frame.empty:
        raise RuntimeError(f"no selector candidates on {trade_date.date()}")

    candidates: list[SelectorCandidate] = []
    for _, row in day_frame.iterrows():
        feature_payload = {
            "volume_ratio20": round(float(row.get("volume_ratio20") or 0.0), 4),
            "dollar_volume_ratio20": round(float(row.get("dollar_volume_ratio20") or 0.0), 4),
            "turnover_ratio20": round(float(row.get("turnover_ratio20") or 0.0), 4),
            "close_to_prev_20d_high": round(float(row.get("close_to_prev_20d_high") or 0.0), 4),
            "receipt_burst_7d": round(float(row.get("receipt_burst_7d") or 0.0), 4),
            "irregular_burst_14d": round(float(row.get("irregular_burst_14d") or 0.0), 4),
            "mezzanine_burst_30d": round(float(row.get("mezzanine_burst_30d") or 0.0), 4),
        }
        candidates.append(
            SelectorCandidate(
                symbol=str(row["stock_code"]).zfill(6),
                name=str(corp_name_map.get(str(row["stock_code"]).zfill(6), str(row["stock_code"]).zfill(6))),
                date=str(trade_date.date()),
                market="KR",
                market_label="국장",
                theme=f"GIND {row['gind']}" if pd.notna(row.get("gind")) else (f"GGROUP {row['ggroup']}" if pd.notna(row.get("ggroup")) else None),
                ggroup=None if pd.isna(row.get("ggroup")) else str(row.get("ggroup")),
                gind=None if pd.isna(row.get("gind")) else str(row.get("gind")),
                selector_score=round(float(row[selector]), 6),
                reasons=selector_reason_strings(row),
                features=feature_payload,
            )
        )

    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "tradeDate": str(trade_date.date()),
        "selector": selector,
        "topK": top_k,
        "candidateCount": len(candidates),
        "candidates": [asdict(candidate) for candidate in candidates],
    }


def write_json(path: Path, payload: Any) -> None:
    ensure_parent(path)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def load_selector_symbols(path: Path) -> dict[str, dict[str, Any]]:
    payload = read_json(path)
    mapping: dict[str, dict[str, Any]] = {}
    for item in payload.get("candidates", []):
        symbol = str(item.get("symbol") or "").zfill(6)
        if symbol:
            mapping[symbol] = item
    return mapping


def normalized_rows_to_frame(rows: list[dict[str, Any]]) -> pd.DataFrame:
    parsed_rows: list[dict[str, Any]] = []
    for row in rows:
        timestamp = str(row.get("bar_time_kst") or "").strip()
        if not timestamp:
            continue
        try:
            dt = datetime.fromisoformat(timestamp)
        except ValueError:
            continue
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=KST)
        dt_kst = dt.astimezone(KST)
        parsed_rows.append(
            {
                "date": int(dt_kst.strftime("%Y%m%d")),
                "time": int(dt_kst.strftime("%H%M")),
                "open": float(row.get("open") or 0.0),
                "high": float(row.get("high") or 0.0),
                "low": float(row.get("low") or 0.0),
                "close": float(row.get("close") or 0.0),
                "volume": float(row.get("volume") or 0.0),
            }
        )
    if not parsed_rows:
        return pd.DataFrame()
    df = pd.DataFrame(parsed_rows)
    return df.sort_values(["date", "time"]).reset_index(drop=True)


def load_fixture_rows(path: Path, symbols: set[str] | None = None) -> dict[str, list[dict[str, Any]]]:
    grouped: dict[str, list[dict[str, Any]]] = {}
    with path.open("r", encoding="utf-8") as handle:
        for raw in handle:
            raw = raw.strip()
            if not raw:
                continue
            row = json.loads(raw)
            symbol = str(row.get("symbol") or "").zfill(6)
            if not symbol:
                continue
            if symbols and symbol not in symbols:
                continue
            grouped.setdefault(symbol, []).append(row)
    return grouped


def fetch_kis_rows(symbols: Iterable[str], lookback_minutes: int) -> dict[str, list[dict[str, Any]]]:
    base_dir = Path(__file__).resolve().parent
    load_env_file(base_dir / ".env")
    poller = KisMinutePoller(build_kis_config())
    grouped: dict[str, list[dict[str, Any]]] = {}
    for symbol in symbols:
        try:
            grouped[symbol] = poller.fetch_recent_minutes(symbol, lookback_minutes)
        except Exception as exc:
            print(f"[WARN] KIS fetch failed for {symbol}: {exc}", file=sys.stderr)
            grouped[symbol] = []
    return grouped


def default_market_return_map(df: pd.DataFrame, default_market_return_pct: float) -> dict[int, float]:
    if df.empty:
        return {}
    dates = df["date"].drop_duplicates().astype(int).tolist()
    return {date: default_market_return_pct for date in dates}


def _score_clip(value: float, low: float, high: float) -> float:
    if math.isnan(value):
        return 0.0
    if high <= low:
        return 0.0
    return max(0.0, min(1.0, (value - low) / (high - low)))


def signal_fit_score(row: pd.Series, formula_key: str) -> float:
    vol = float(row.get("expected_volume_ratio") or 0.0)
    amt = float(row.get("expected_amount_ratio") or 0.0)
    change = float(row.get("change_pct") or 0.0)
    rel = float(row.get("relative_strength_pct") or 0.0)
    prev_change = float(row.get("prev_change_pct") or 0.0)
    prev_volume_ratio = float(row.get("prev_volume_ratio20") or 0.0)
    range_pct = float(row.get("intraday_range_pct") or 0.0)
    close_to_high = float(row.get("close_to_high_pct") or 0.0)
    distance_prev_high = float(row.get("distance_prev_high_pct") or 99.0)

    if formula_key == "A_volume_spike":
        score = 50 + 25 * _score_clip(vol, 2.5, 6.0) + 15 * _score_clip(amt, 2.0, 5.0) + 10 * _score_clip(change, 2.0, 12.0)
    elif formula_key == "F_follow_through":
        score = 55 + 20 * _score_clip(prev_change, 8.0, 20.0) + 15 * _score_clip(prev_volume_ratio, 3.0, 8.0) + 10 * _score_clip(vol, 1.2, 3.0)
    elif formula_key == "M_market_relative_strength":
        score = 55 + 20 * _score_clip(rel, 4.0, 12.0) + 15 * _score_clip(change, 3.0, 10.0) + 10 * _score_clip(vol, 1.5, 4.0)
    elif formula_key == "K_vwap_reclaim":
        score = 52 + 20 * _score_clip(float(row.get("bar_volume_ratio5") or 0.0), 1.5, 4.0) + 18 * _score_clip(change, 0.0, 8.0) + 10 * _score_clip(close_to_high, 96.0, 100.0)
    elif formula_key == "E_pullback_rebreak":
        score = 52 + 18 * _score_clip(vol, 1.5, 4.0) + 18 * _score_clip(change, 1.0, 8.0) + 12 * _score_clip(close_to_high, 95.0, 100.0)
    elif formula_key == "B_prev_high_approach":
        score = 50 + 25 * _score_clip(3.0 - max(distance_prev_high, 0.0), 0.0, 3.0) + 15 * _score_clip(vol, 1.5, 3.0) + 10 * _score_clip(change, 0.0, 5.0)
    elif formula_key == "C_new_high_breakout":
        score = 52 + 18 * _score_clip(vol, 1.5, 4.0) + 18 * _score_clip(amt, 1.2, 4.0) + 12 * _score_clip(change, 1.0, 8.0)
    elif formula_key == "D_box_breakout":
        score = 52 + 20 * _score_clip(vol, 1.8, 4.0) + 18 * _score_clip(change, 1.0, 8.0) + 10 * _score_clip(close_to_high, 95.0, 100.0)
    elif formula_key == "H_risk_watch":
        score = 55 + 18 * _score_clip(change, 15.0, 30.0) + 14 * _score_clip(vol, 5.0, 10.0) + 13 * _score_clip(range_pct, 12.0, 25.0)
    elif formula_key == "I_opening_gap_hold":
        score = 52 + 20 * _score_clip(float(row.get("gap_pct") or 0.0), 3.0, 10.0) + 18 * _score_clip(vol, 2.0, 5.0) + 10 * _score_clip(close_to_high, 96.0, 100.0)
    elif formula_key == "J_morning_high_rebreak":
        score = 52 + 18 * _score_clip(vol, 1.8, 4.0) + 18 * _score_clip(change, 2.0, 9.0) + 10 * _score_clip(close_to_high, 96.0, 100.0)
    elif formula_key == "N_afternoon_reacceleration":
        score = 52 + 18 * _score_clip(vol, 1.3, 3.5) + 18 * _score_clip(change, 2.0, 8.0) + 10 * _score_clip(close_to_high, 96.0, 100.0)
    elif formula_key == "O_limit_up_watch":
        score = 60 + 18 * _score_clip(change, 25.0, 30.0) + 12 * _score_clip(vol, 3.0, 7.0) + 10 * _score_clip(close_to_high, 99.0, 100.0)
    else:
        score = 60.0
    return round(float(min(99.0, max(50.0, score))), 2)


def signal_reasons(row: pd.Series, formula_key: str) -> tuple[list[str], list[str], str]:
    vol = float(row.get("expected_volume_ratio") or 0.0)
    amt = float(row.get("expected_amount_ratio") or 0.0)
    change = float(row.get("change_pct") or 0.0)
    rel = float(row.get("relative_strength_pct") or 0.0)
    matched: list[str] = []
    risk: list[str] = []

    if formula_key == "A_volume_spike":
        matched = [f"거래량 {vol:.1f}배", f"거래대금 {amt:.1f}배", f"등락률 {change:+.1f}%"]
    elif formula_key == "F_follow_through":
        matched = [
            f"전일 등락률 {float(row.get('prev_change_pct') or 0.0):+.1f}%",
            f"전일 거래량 {float(row.get('prev_volume_ratio20') or 0.0):.1f}배",
            f"오늘 거래량 {vol:.1f}배",
        ]
    elif formula_key == "M_market_relative_strength":
        matched = [f"상대강도 {rel:+.1f}%p", f"등락률 {change:+.1f}%", f"거래량 {vol:.1f}배"]
    elif formula_key == "K_vwap_reclaim":
        matched = [f"VWAP 재장악", f"직전 5봉 대비 {float(row.get('bar_volume_ratio5') or 0.0):.1f}배", f"등락률 {change:+.1f}%"]
    elif formula_key == "E_pullback_rebreak":
        matched = [f"전고점 대비 {float(row.get('pullback_depth_pct') or 0.0):.1f}%", f"거래량 {vol:.1f}배", f"등락률 {change:+.1f}%"]
    elif formula_key == "B_prev_high_approach":
        matched = [f"전고점 {float(row.get('distance_prev_high_pct') or 0.0):.1f}% 거리", f"거래량 {vol:.1f}배", f"등락률 {change:+.1f}%"]
    elif formula_key == "C_new_high_breakout":
        matched = [f"20일 고점 돌파", f"거래량 {vol:.1f}배", f"거래대금 {amt:.1f}배"]
    elif formula_key == "D_box_breakout":
        matched = [f"박스 상단 돌파", f"거래량 {vol:.1f}배", f"등락률 {change:+.1f}%"]
    elif formula_key == "H_risk_watch":
        matched = [f"등락률 {change:+.1f}%", f"거래량 {vol:.1f}배", f"변동폭 {float(row.get('intraday_range_pct') or 0.0):.1f}%"]
        risk = ["과열 주의", "단기 변동성 큼"]
    elif formula_key == "I_opening_gap_hold":
        matched = [f"시초 갭 {float(row.get('gap_pct') or 0.0):+.1f}%", f"거래량 {vol:.1f}배", "VWAP 위 유지"]
    elif formula_key == "J_morning_high_rebreak":
        matched = ["오전 고점 재돌파", f"거래량 {vol:.1f}배", f"등락률 {change:+.1f}%"]
    elif formula_key == "N_afternoon_reacceleration":
        matched = ["오후 재가속", f"거래량 {vol:.1f}배", f"등락률 {change:+.1f}%"]
    elif formula_key == "O_limit_up_watch":
        matched = [f"등락률 {change:+.1f}%", f"고가권 {float(row.get('close_to_high_pct') or 0.0):.1f}%", f"거래량 {vol:.1f}배"]
        risk = ["상한가 근접", "추격 주의"]
    else:
        matched = [f"거래량 {vol:.1f}배", f"등락률 {change:+.1f}%"]

    if float(row.get("intraday_range_pct") or 0.0) >= 12:
        risk.append("장중 변동성 확대")
    if float(row.get("expected_amount_ratio") or 0.0) < 1.0:
        risk.append("거래대금 약함")
    risk = list(dict.fromkeys(risk))
    alert_line = " · ".join(matched[:3])
    return matched[:3], risk[:3], alert_line


def build_technical_snapshot(row: pd.Series) -> dict[str, Any]:
    return {
        "timeAdjustedVolumeRatio": round(float(row.get("expected_volume_ratio") or 0.0), 4),
        "timeAdjustedAmountRatio": round(float(row.get("expected_amount_ratio") or 0.0), 4),
        "distanceToPrevHighPct": None if pd.isna(row.get("distance_prev_high_pct")) else round(float(row.get("distance_prev_high_pct") or 0.0), 4),
        "boxRangePct": None if pd.isna(row.get("box_range_pct")) else round(float(row.get("box_range_pct") or 0.0), 4),
        "boxBreakout": bool(row.get("box_breakout")),
        "closeToHighPct": None if pd.isna(row.get("close_to_high_pct")) else round(float(row.get("close_to_high_pct") or 0.0), 4),
        "intradayRangePct": None if pd.isna(row.get("intraday_range_pct")) else round(float(row.get("intraday_range_pct") or 0.0), 4),
        "isAboveMa5": bool(row.get("is_above_ma5")),
        "isAboveVwap": bool(row.get("is_above_vwap")),
        "gapPct": None if pd.isna(row.get("gap_pct")) else round(float(row.get("gap_pct") or 0.0), 4),
        "morningHighBreakout": bool(row.get("morning_high_rebreak")),
        "vwapReclaim": bool(row.get("vwap_reclaim")),
        "afternoonReacceleration": bool(row.get("afternoon_reacceleration")),
        "pullbackDepthPct": None if pd.isna(row.get("pullback_depth_pct")) else round(float(row.get("pullback_depth_pct") or 0.0), 4),
        "previousDayChangePct": None if pd.isna(row.get("prev_change_pct")) else round(float(row.get("prev_change_pct") or 0.0), 4),
        "previousDayVolumeRatio20": None if pd.isna(row.get("prev_volume_ratio20")) else round(float(row.get("prev_volume_ratio20") or 0.0), 4),
        "marketRelativeStrengthPct": None if pd.isna(row.get("relative_strength_pct")) else round(float(row.get("relative_strength_pct") or 0.0), 4),
    }


def evaluate_symbol_realtime(
    symbol: str,
    rows: list[dict[str, Any]],
    selector_info: dict[str, Any] | None,
    default_market_return_pct: float,
    min_amount: float,
    cooldown_bars: int,
    trigger_window_bars: int,
) -> list[FormulaSignalPayload]:
    df = normalized_rows_to_frame(rows)
    if df.empty:
        return []
    market_returns = default_market_return_map(df, default_market_return_pct)
    df = add_features(df, market_returns)
    masks = formula_masks(df, min_amount)

    latest_date = int(df["date"].iloc[-1])
    latest_minute_index = int(df[df["date"] == latest_date]["minute_index"].max())
    triggered: list[FormulaSignalPayload] = []
    latest_row = df.iloc[-1]

    for formula_key, mask in masks.items():
        idxs = cooldown_indices(mask.fillna(False), df, cooldown_bars)
        if not idxs:
            continue
        fresh_idxs = [
            idx
            for idx in idxs
            if int(df.at[idx, "date"]) == latest_date
            and latest_minute_index - int(df.at[idx, "minute_index"]) < trigger_window_bars
        ]
        if not fresh_idxs:
            continue
        idx = fresh_idxs[-1]
        row = df.loc[idx]
        fit_score = signal_fit_score(row, formula_key)
        matched_reasons, risk_tags, alert_line = signal_reasons(row, formula_key)
        triggered.append(
            FormulaSignalPayload(
                symbol=symbol,
                name=str(selector_info.get("name") if selector_info else symbol),
                market=str(selector_info.get("market") if selector_info else "KR"),
                market_label=str(selector_info.get("market_label") if selector_info else "국장"),
                theme=None if not selector_info else selector_info.get("theme"),
                formula_key=formula_key,
                formula_name=FORMULA_NAMES.get(formula_key, formula_key),
                triggered_at=datetime(
                    year=int(str(latest_date)[:4]),
                    month=int(str(latest_date)[4:6]),
                    day=int(str(latest_date)[6:8]),
                    hour=int(str(int(row["time"])).zfill(4)[:2]),
                    minute=int(str(int(row["time"])).zfill(4)[2:4]),
                    tzinfo=KST,
                ).isoformat(),
                fit_score=fit_score,
                alert_line=alert_line,
                matched_reasons=matched_reasons,
                risk_tags=risk_tags,
                latest_bar={
                    "time": int(latest_row["time"]),
                    "close": float(latest_row["close"]),
                    "cumAmount": float(latest_row.get("cum_amount") or 0.0),
                    "changePct": round(float(latest_row.get("change_pct") or 0.0), 4),
                },
                technical_snapshot=build_technical_snapshot(row),
                selector_score=None if not selector_info else float(selector_info.get("selector_score") or 0.0),
                selector_reasons=None if not selector_info else list(selector_info.get("reasons") or []),
            )
        )
    triggered.sort(key=lambda item: (-item.fit_score, item.formula_key))
    return triggered


def load_alert_subscriptions(path: Path | None) -> list[dict[str, Any]]:
    if path is None or not path.exists():
        return []
    payload = read_json(path)
    if isinstance(payload, dict):
        return list(payload.get("alerts", []))
    if isinstance(payload, list):
        return payload
    return []


def is_alert_active(alert: dict[str, Any], now: datetime) -> bool:
    if str(alert.get("status") or "active") != "active":
        return False
    expires_at = alert.get("expiresAt")
    if not expires_at:
        return True
    try:
        expires = datetime.fromisoformat(str(expires_at))
    except ValueError:
        return True
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=KST)
    return expires > now


def match_alerts(signals: list[FormulaSignalPayload], alerts: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not alerts:
        return []
    by_symbol_formula = {(signal.symbol, signal.formula_key): signal for signal in signals}
    now = now_kst()
    matches: list[dict[str, Any]] = []
    for alert in alerts:
        if not is_alert_active(alert, now):
            continue
        symbol = str(alert.get("symbol") or "").zfill(6)
        formula_key = str(alert.get("formulaKey") or "")
        signal = by_symbol_formula.get((symbol, formula_key))
        if not signal:
            continue
        matches.append(
            {
                "alertId": str(alert.get("id") or f"fixture_{symbol}_{formula_key}"),
                "anonUserId": str(alert.get("anonUserId") or "fixture-user"),
                "cardKey": str(alert.get("cardKey") or f"realtime:{symbol}:{signal.formula_key}"),
                "assetKey": str(alert.get("assetKey") or f"KR:{symbol}"),
                "formulaKey": signal.formula_key,
                "triggeredAt": signal.triggered_at,
                "triggerBasis": {
                    "fitScore": signal.fit_score,
                    "alertLine": signal.alert_line,
                    "matchedReasons": signal.matched_reasons,
                    "riskTags": signal.risk_tags,
                },
                "metadata": {
                    "source": "realtime-signal-engine",
                    "symbol": signal.symbol,
                    "formulaName": signal.formula_name,
                    "selectorScore": signal.selector_score,
                    "selectorReasons": signal.selector_reasons or [],
                    "deliveryStatus": "pending",
                    "pushPreview": f"{signal.symbol} {signal.formula_name} · {signal.alert_line}",
                },
            }
        )
    return matches


def formula_to_card_type(formula_key: str) -> str:
    mapping = {
        "A_volume_spike": "kr_volume",
        "B_prev_high_approach": "chart_setup",
        "C_new_high_breakout": "kr_gainer",
        "D_box_breakout": "chart_setup",
        "E_pullback_rebreak": "chart_setup",
        "F_follow_through": "kr_gainer",
        "H_risk_watch": "kr_loser",
        "I_opening_gap_hold": "kr_gainer",
        "J_morning_high_rebreak": "kr_gainer",
        "K_vwap_reclaim": "chart_setup",
        "M_market_relative_strength": "kr_gainer",
        "N_afternoon_reacceleration": "kr_gainer",
        "O_limit_up_watch": "kr_loser",
    }
    return mapping.get(formula_key, "kr_gainer")


def signal_to_display_card(signal: FormulaSignalPayload) -> dict[str, Any]:
    technical = signal.technical_snapshot or {}
    labels = list(dict.fromkeys([
        signal.formula_name,
        *(signal.selector_reasons or [])[:2],
        *(signal.risk_tags or [])[:2],
    ]))
    chart_setup = "실시간 조건식 감지"
    if technical.get("morningHighBreakout"):
        chart_setup = "오전 고점 재돌파"
    elif technical.get("vwapReclaim"):
        chart_setup = "VWAP 재장악"
    elif technical.get("afternoonReacceleration"):
        chart_setup = "오후 재가속"
    elif signal.formula_key == "A_volume_spike":
        chart_setup = "거래량·거래대금 급증"
    return {
        "id": f"live:{signal.symbol}:{signal.formula_key}",
        "assetKey": signal.symbol,
        "symbol": signal.symbol,
        "name": signal.name,
        "market": signal.market,
        "marketLabel": signal.market_label,
        "theme": signal.theme,
        "cardType": formula_to_card_type(signal.formula_key),
        "title": f"{signal.name} 실시간 조건식 감지",
        "primaryReason": signal.alert_line,
        "secondaryReason": " · ".join(signal.selector_reasons[:2]) if signal.selector_reasons else "실시간 1분 시세 + 일봉 선별 기준",
        "price": signal.latest_bar.get("close"),
        "changePct": signal.latest_bar.get("changePct"),
        "amount": signal.latest_bar.get("cumAmount"),
        "labels": labels[:5],
        "dataBasisLabel": f"실시간 1분봉 + 종목식 · {signal.formula_name}",
        "source": "realtime-backend",
        "updatedAt": signal.triggered_at,
        "tvSymbol": f"KRX:{signal.symbol}" if signal.market == "KR" else None,
        "chartSetupType": chart_setup,
        "technicalSnapshot": technical,
        "riskSnapshot": {
            "isInvestmentWarning": "과열 주의" in (signal.risk_tags or []),
            "isLowLiquidity": "거래대금 약함" in (signal.risk_tags or []),
            "overheatScore": signal.fit_score if signal.formula_key in {"H_risk_watch", "O_limit_up_watch"} else 0,
        },
        "isWidget": False,
        "isMock": False,
      }


def write_frontend_live_payload(out_dir: Path, signals: list[FormulaSignalPayload], alert_triggers: list[dict[str, Any]]) -> dict[str, str]:
    frontend_dir = out_dir / "frontend"
    cards = [signal_to_display_card(signal) for signal in signals]
    feed_payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": "realtime-backend",
        "items": cards,
        "cards": cards,
    }
    trigger_payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": "realtime-backend",
        "items": alert_triggers,
        "triggers": alert_triggers,
    }
    feed_path = frontend_dir / "live-feed.json"
    trigger_path = frontend_dir / "live-alert-triggers.json"
    write_json(feed_path, feed_payload)
    write_json(trigger_path, trigger_payload)
    return {"feedPath": str(feed_path), "liveTriggersPath": str(trigger_path)}


def run_once(
    source: str,
    selector_json: Path,
    out_dir: Path,
    fixture_jsonl: Path | None,
    lookback_minutes: int,
    min_amount: float,
    cooldown_bars: int,
    trigger_window_bars: int,
    default_market_return_pct: float,
    alerts_json: Path | None,
    symbols_override: list[str] | None,
) -> dict[str, Any]:
    selector_map = load_selector_symbols(selector_json)
    if not selector_map:
        raise RuntimeError(f"no selector symbols found in {selector_json}")
    symbols = symbols_override or sorted(selector_map)
    if source == "fixture":
        if fixture_jsonl is None:
            raise RuntimeError("fixture source requires --fixture-jsonl")
        grouped_rows = load_fixture_rows(fixture_jsonl, set(symbols))
    elif source == "kis":
        grouped_rows = fetch_kis_rows(symbols, lookback_minutes)
    else:
        raise RuntimeError(f"unsupported source: {source}")

    all_signals: list[FormulaSignalPayload] = []
    for symbol in symbols:
        rows = grouped_rows.get(symbol, [])
        if not rows:
            continue
        all_signals.extend(
            evaluate_symbol_realtime(
                symbol=symbol,
                rows=rows,
                selector_info=selector_map.get(symbol),
                default_market_return_pct=default_market_return_pct,
                min_amount=min_amount,
                cooldown_bars=cooldown_bars,
                trigger_window_bars=trigger_window_bars,
            )
        )

    alerts = load_alert_subscriptions(alerts_json)
    alert_triggers = match_alerts(all_signals, alerts)

    signals_payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": source,
        "selectorSnapshot": str(selector_json),
        "selectedSymbolCount": len(symbols),
        "signals": [asdict(item) for item in all_signals],
    }
    triggers_payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": source,
        "matchedTriggerCount": len(alert_triggers),
        "triggers": alert_triggers,
    }
    write_json(out_dir / "formula_signals_latest.json", signals_payload)
    write_json(out_dir / "alert_triggers_latest.json", triggers_payload)
    frontend_paths = write_frontend_live_payload(out_dir, all_signals, alert_triggers)
    return {
        "selectedSymbols": len(symbols),
        "symbolsWithBars": sum(1 for symbol in symbols if grouped_rows.get(symbol)),
        "signalCount": len(all_signals),
        "alertTriggerCount": len(alert_triggers),
        "signalsPath": str(out_dir / "formula_signals_latest.json"),
        "triggersPath": str(out_dir / "alert_triggers_latest.json"),
        **frontend_paths,
    }


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)

    selector_parser = sub.add_parser("build-selector", help="Build latest daily selector snapshot")
    selector_parser.add_argument("--selector", default="base_selector_score")
    selector_parser.add_argument("--top-k", type=int, default=50)
    selector_parser.add_argument("--start-date", default="2000-03-01")
    selector_parser.add_argument("--target-date")
    selector_parser.add_argument("--out", default=str(DEFAULT_OUT_DIR / "daily_selector_latest.json"))

    once_parser = sub.add_parser("run-once", help="Evaluate realtime minute formulas once")
    once_parser.add_argument("--source", choices=["fixture", "kis"], default="fixture")
    once_parser.add_argument("--selector-json", default=str(DEFAULT_OUT_DIR / "daily_selector_latest.json"))
    once_parser.add_argument("--fixture-jsonl")
    once_parser.add_argument("--alerts-json")
    once_parser.add_argument("--symbols", help="Optional comma-separated symbols override")
    once_parser.add_argument("--out-dir", default=str(DEFAULT_OUT_DIR))
    once_parser.add_argument("--lookback-minutes", type=int, default=120)
    once_parser.add_argument("--min-amount", type=float, default=2_000_000_000)
    once_parser.add_argument("--cooldown-bars", type=int, default=30)
    once_parser.add_argument("--trigger-window-bars", type=int, default=3)
    once_parser.add_argument("--default-market-return-pct", type=float, default=0.0)

    loop_parser = sub.add_parser("loop", help="Repeated realtime evaluation")
    loop_parser.add_argument("--source", choices=["fixture", "kis"], default="kis")
    loop_parser.add_argument("--selector-json", default=str(DEFAULT_OUT_DIR / "daily_selector_latest.json"))
    loop_parser.add_argument("--fixture-jsonl")
    loop_parser.add_argument("--alerts-json")
    loop_parser.add_argument("--symbols", help="Optional comma-separated symbols override")
    loop_parser.add_argument("--out-dir", default=str(DEFAULT_OUT_DIR))
    loop_parser.add_argument("--lookback-minutes", type=int, default=120)
    loop_parser.add_argument("--min-amount", type=float, default=2_000_000_000)
    loop_parser.add_argument("--cooldown-bars", type=int, default=30)
    loop_parser.add_argument("--trigger-window-bars", type=int, default=3)
    loop_parser.add_argument("--default-market-return-pct", type=float, default=0.0)
    loop_parser.add_argument("--poll-seconds", type=int, default=60)

    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    if args.command == "build-selector":
        payload = build_selector_snapshot(
            selector=args.selector,
            top_k=args.top_k,
            start_date=args.start_date,
            target_date=args.target_date,
        )
        out_path = Path(args.out).resolve()
        write_json(out_path, payload)
        print(json.dumps({"ok": True, "command": "build-selector", "out": str(out_path), "candidateCount": payload["candidateCount"]}, ensure_ascii=False))
        return 0

    if args.command in {"run-once", "loop"}:
        selector_json = Path(args.selector_json).resolve()
        fixture_jsonl = Path(args.fixture_jsonl).resolve() if getattr(args, "fixture_jsonl", None) else None
        alerts_json = Path(args.alerts_json).resolve() if getattr(args, "alerts_json", None) else None
        out_dir = Path(args.out_dir).resolve()
        symbols_override = None
        if getattr(args, "symbols", None):
            symbols_override = [token.strip().zfill(6) for token in args.symbols.split(",") if token.strip()]
        while True:
            summary = run_once(
                source=args.source,
                selector_json=selector_json,
                out_dir=out_dir,
                fixture_jsonl=fixture_jsonl,
                lookback_minutes=args.lookback_minutes,
                min_amount=args.min_amount,
                cooldown_bars=args.cooldown_bars,
                trigger_window_bars=args.trigger_window_bars,
                default_market_return_pct=args.default_market_return_pct,
                alerts_json=alerts_json,
                symbols_override=symbols_override,
            )
            print(json.dumps({"ok": True, "command": args.command, **summary}, ensure_ascii=False))
            if args.command == "run-once":
                return 0
            time.sleep(max(int(args.poll_seconds), 1))

    raise RuntimeError(f"unsupported command: {args.command}")


if __name__ == "__main__":
    raise SystemExit(main())
