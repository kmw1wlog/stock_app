#!/usr/bin/env python3
"""Build KR formula-signal cards from yfinance OHLCV data.

This worker is for MVP validation. It uses Yahoo Finance data through yfinance,
so generated cards are labeled as delayed/development validation data rather
than production-grade real-time market data.
"""

from __future__ import annotations

import argparse
import json
import math
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    import pandas as pd
    import yfinance as yf
except ImportError as exc:  # pragma: no cover - exercised by CLI environment
    raise SystemExit("yfinance/pandas missing. Run: python3 -m pip install --user --break-system-packages yfinance pandas") from exc


@dataclass(frozen=True)
class AssetSeed:
    symbol: str
    yahoo: str
    name: str
    market: str
    theme: str
    tv_symbol: str


ASSETS = [
    AssetSeed("005930", "005930.KS", "삼성전자", "KOSPI", "반도체", "KRX:005930"),
    AssetSeed("000660", "000660.KS", "SK하이닉스", "KOSPI", "반도체", "KRX:000660"),
    AssetSeed("042700", "042700.KS", "한미반도체", "KOSPI", "반도체", "KRX:042700"),
    AssetSeed("058470", "058470.KQ", "리노공업", "KOSDAQ", "반도체", "KOSDAQ:058470"),
    AssetSeed("247540", "247540.KQ", "에코프로비엠", "KOSDAQ", "이차전지", "KOSDAQ:247540"),
    AssetSeed("003670", "003670.KS", "포스코퓨처엠", "KOSPI", "이차전지", "KRX:003670"),
    AssetSeed("066970", "066970.KQ", "엘앤에프", "KOSDAQ", "이차전지", "KOSDAQ:066970"),
    AssetSeed("277810", "277810.KQ", "레인보우로보틱스", "KOSDAQ", "로봇", "KOSDAQ:277810"),
    AssetSeed("454910", "454910.KS", "두산로보틱스", "KOSPI", "로봇", "KRX:454910"),
    AssetSeed("035420", "035420.KS", "NAVER", "KOSPI", "AI", "KRX:035420"),
    AssetSeed("035720", "035720.KS", "카카오", "KOSPI", "AI", "KRX:035720"),
    AssetSeed("005380", "005380.KS", "현대차", "KOSPI", "자동차", "KRX:005380"),
]


def as_float(value: Any) -> float | None:
    try:
        if value is None or (isinstance(value, float) and math.isnan(value)):
            return None
        return float(value)
    except (TypeError, ValueError):
        return None


def pct(current: float | None, previous: float | None) -> float | None:
    if current is None or previous in (None, 0):
        return None
    return (current / previous - 1) * 100


def safe_ratio(current: float | None, base: float | None) -> float | None:
    if current is None or base in (None, 0):
        return None
    return current / base


def download_group(tickers: list[str], period: str, interval: str) -> dict[str, "pd.DataFrame"]:
    data = yf.download(tickers, period=period, interval=interval, group_by="ticker", auto_adjust=False, threads=True, progress=False)
    if data.empty:
        return {}
    frames: dict[str, pd.DataFrame] = {}
    for ticker in tickers:
        try:
            frame = data[ticker].dropna(how="all")
        except Exception:
            frame = pd.DataFrame()
        if not frame.empty:
            frames[ticker] = frame
    return frames


def compute_vwap(frame: "pd.DataFrame") -> float | None:
    if frame.empty or "Volume" not in frame:
        return None
    typical = (frame["High"] + frame["Low"] + frame["Close"]) / 3
    volume = frame["Volume"].fillna(0)
    total_volume = as_float(volume.sum())
    if not total_volume:
        return None
    return as_float((typical * volume).sum() / total_volume)


def feature_for(asset: AssetSeed, daily: "pd.DataFrame", intraday: "pd.DataFrame") -> dict[str, Any] | None:
    if daily.empty or len(daily) < 22:
        return None
    daily = daily.dropna(subset=["Close"])
    if daily.empty:
        return None
    latest = daily.iloc[-1]
    previous = daily.iloc[-2] if len(daily) >= 2 else latest
    close = as_float(latest.get("Close"))
    prev_close = as_float(previous.get("Close"))
    high = as_float(latest.get("High"))
    low = as_float(latest.get("Low"))
    open_price = as_float(latest.get("Open"))
    volume = as_float(latest.get("Volume")) or 0.0
    amount = volume * close if close else None
    change_pct = pct(close, prev_close)
    day20 = daily.tail(21).head(20)
    avg_volume20 = as_float(day20["Volume"].mean())
    avg_amount20 = as_float((day20["Volume"] * day20["Close"]).mean())
    volume_ratio = safe_ratio(volume, avg_volume20) or 0
    amount_ratio = safe_ratio(amount, avg_amount20) or 0
    prev_high20 = as_float(daily.tail(21).head(20)["High"].max())
    distance_to_prev_high = ((prev_high20 - close) / prev_high20 * 100) if close and prev_high20 else None
    high20 = as_float(daily.tail(20)["High"].max())
    low20 = as_float(daily.tail(20)["Low"].min())
    box_range = ((high20 - low20) / close * 100) if close and high20 and low20 else None
    ma5 = as_float(daily.tail(5)["Close"].mean())
    ma20 = as_float(daily.tail(20)["Close"].mean())
    previous_day_change = pct(prev_close, as_float(daily.iloc[-3].get("Close")) if len(daily) >= 3 else None)
    previous_day_volume_ratio = safe_ratio(as_float(previous.get("Volume")), avg_volume20) or 0
    vwap = compute_vwap(intraday) if not intraday.empty else None
    intraday_high = as_float(intraday["High"].max()) if not intraday.empty else high
    intraday_low = as_float(intraday["Low"].min()) if not intraday.empty else low
    intraday_range = ((intraday_high - intraday_low) / close * 100) if close and intraday_high and intraday_low else abs(change_pct or 0)
    close_to_high = (close / intraday_high * 100) if close and intraday_high else None
    gap = pct(open_price, prev_close)
    pullback_depth = ((close / prev_high20 - 1) * 100) if close and prev_high20 and close < prev_high20 else 0
    pullback_days = 0
    for _, row in daily.tail(10).iloc[::-1].iterrows():
        row_close = as_float(row.get("Close"))
        if row_close and prev_high20 and row_close < prev_high20 * 0.95:
            pullback_days += 1
        elif pullback_days:
            break
    is_above_vwap = bool(vwap and close and close >= vwap)
    box_breakout = bool(close and high20 and close >= high20 and box_range is not None and box_range <= 12)
    breakout_days = 20 if close and prev_high20 and close > prev_high20 else None
    upper_wick = ((high - close) / close * 100) if close and high else 0
    low_liquidity = bool(amount is not None and amount < 2_000_000_000)
    return {
        "asset": asset,
        "price": close,
        "changePct": change_pct,
        "volume": volume,
        "amount": amount,
        "technicalSnapshot": {
            "timeAdjustedVolumeRatio": round(volume_ratio, 2),
            "timeAdjustedAmountRatio": round(amount_ratio, 2),
            "volumeRatio20": round(volume_ratio, 2),
            "amountRatio20": round(amount_ratio, 2),
            "distanceToPrevHighPct": round(distance_to_prev_high, 2) if distance_to_prev_high is not None else None,
            "breakoutLookbackDays": breakout_days,
            "boxRangePct": round(box_range, 2) if box_range is not None else None,
            "boxBreakout": box_breakout,
            "closeToHighPct": round(close_to_high, 2) if close_to_high is not None else None,
            "intradayRangePct": round(intraday_range, 2),
            "ma5Slope": round(((ma5 / ma20) - 1) * 100, 2) if ma5 and ma20 else None,
            "ma20Slope": None,
            "isAboveMa5": bool(close and ma5 and close >= ma5),
            "isAboveVwap": is_above_vwap,
            "gapPct": round(gap, 2) if gap is not None else None,
            "morningHighBreakout": False,
            "vwapReclaim": is_above_vwap and bool(change_pct and change_pct > 0),
            "afternoonReacceleration": False,
            "pullbackDays": pullback_days,
            "pullbackDepthPct": round(pullback_depth, 2),
            "previousDayChangePct": round(previous_day_change, 2) if previous_day_change is not None else None,
            "previousDayVolumeRatio20": round(previous_day_volume_ratio, 2),
            "marketRelativeStrengthPct": round(change_pct or 0, 2),
        },
        "riskSnapshot": {
            "isInvestmentWarning": False,
            "isLowLiquidity": low_liquidity,
            "upperWickPct": round(upper_wick, 2),
            "gapPct": round(gap, 2) if gap is not None else None,
            "overheatScore": 90 if (change_pct or 0) >= 25 else 75 if (change_pct or 0) >= 15 else 40 if (change_pct or 0) >= 10 else 0,
        },
    }


def theme_snapshots(features: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    by_theme: dict[str, list[dict[str, Any]]] = {}
    for item in features:
        by_theme.setdefault(item["asset"].theme, []).append(item)
    result: dict[str, dict[str, Any]] = {}
    for theme, rows in by_theme.items():
        total = len(rows)
        up = [row for row in rows if (row.get("changePct") or 0) > 0]
        amount_sum = sum(row.get("amount") or 0 for row in rows)
        weighted_return = sum((row.get("changePct") or 0) * ((row.get("amount") or 0) / amount_sum) for row in rows) if amount_sum else sum(row.get("changePct") or 0 for row in rows) / max(total, 1)
        amount_ratio = sum(row["technicalSnapshot"].get("timeAdjustedAmountRatio") or 0 for row in rows) / max(total, 1)
        volume_ratio = sum(row["technicalSnapshot"].get("timeAdjustedVolumeRatio") or 0 for row in rows) / max(total, 1)
        leader = max(rows, key=lambda row: row.get("amount") or 0)
        result[theme] = {
            "themeBreadthUpCount": len(up),
            "themeTotalCount": total,
            "themeAvgChangePct": round(weighted_return, 2),
            "themeAmountRatio": round(amount_ratio, 2),
            "themeVolumeRatio": round(volume_ratio, 2),
            "themeLeaderSymbol": leader["asset"].symbol,
        }
    return result


def to_card(row: dict[str, Any], theme_snapshot: dict[str, Any], detected_at: str) -> dict[str, Any]:
    asset: AssetSeed = row["asset"]
    theme_role = "leader" if theme_snapshot.get("themeLeaderSymbol") == asset.symbol else "follower"
    theme = {**theme_snapshot, "isThemeLeader": theme_role == "leader", "themeRole": theme_role}
    tech = {k: v for k, v in row["technicalSnapshot"].items() if v is not None}
    risk = {k: v for k, v in row["riskSnapshot"].items() if v is not None}
    volume_ratio = tech.get("timeAdjustedVolumeRatio", 0)
    amount_ratio = tech.get("timeAdjustedAmountRatio", 0)
    reasons = [
        f"현재 시각 기준 거래량 {volume_ratio:.1f}배" if volume_ratio else None,
        f"거래대금 {amount_ratio:.1f}배" if amount_ratio else None,
        f"{asset.theme} 테마 {theme.get('themeBreadthUpCount', 0)}종목 상승",
    ]
    primary_reason = " · ".join([reason for reason in reasons if reason])
    return {
        "id": f"yf-kr-{asset.symbol}",
        "assetKey": asset.symbol,
        "symbol": asset.symbol,
        "name": asset.name,
        "market": "KR",
        "marketLabel": "국장",
        "theme": asset.theme,
        "cardType": "volume_spike",
        "title": f"{asset.name} yfinance 조건식 스캔",
        "primaryReason": primary_reason or "Yahoo Finance 지연 데이터 기준 조건식 스캔",
        "secondaryReason": "yfinance 기반 개발 검증용 데이터입니다. 상용 알림은 정식 시세 API 전환이 필요합니다.",
        "price": row.get("price"),
        "changePct": row.get("changePct"),
        "volume": row.get("volume"),
        "amount": row.get("amount"),
        "labels": ["yfinance 개발 검증용", "시간대 보정 거래량", f"{asset.theme} 테마", f"테마 {theme_role}"],
        "dataBasisLabel": "Yahoo Finance 지연 데이터 / 개발 검증용",
        "source": "yfinance",
        "updatedAt": detected_at,
        "tvSymbol": asset.tv_symbol,
        "chartSetupType": "조건식 TA 스캔",
        "isWidget": False,
        "isMock": False,
        "technicalSnapshot": tech,
        "themeSnapshot": theme,
        "riskSnapshot": risk,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default="public/data/yfinance-formula-signals.json")
    parser.add_argument("--limit", type=int, default=12)
    args = parser.parse_args()
    picked = ASSETS[: args.limit]
    tickers = [asset.yahoo for asset in picked]
    daily_frames = download_group(tickers, "90d", "1d")
    intraday_frames = download_group(tickers, "5d", "5m")
    rows: list[dict[str, Any]] = []
    for asset in picked:
        feature = feature_for(asset, daily_frames.get(asset.yahoo, pd.DataFrame()), intraday_frames.get(asset.yahoo, pd.DataFrame()))
        if feature:
            rows.append(feature)
    detected_at = datetime.now(timezone.utc).isoformat()
    themes = theme_snapshots(rows)
    cards = [to_card(row, themes[row["asset"].theme], detected_at) for row in rows]
    payload = {
        "ok": bool(cards),
        "source": "yfinance",
        "basis": "Yahoo Finance 지연 데이터 / 개발 검증용",
        "generatedAt": detected_at,
        "items": cards,
    }
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"ok": bool(cards), "count": len(cards), "out": str(out), "sample": cards[0] if cards else None}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
