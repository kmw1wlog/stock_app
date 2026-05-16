#!/usr/bin/env python3
"""Cross-sectional KOSDAQ selector backtest with disclosure event features.

This script compares:
  - a price/liquidity-only selector
  - a disclosure-only selector
  - a combined selector that adds disclosure bursts to the price selector

Target:
  A stock-day is a "surge hit" if the maximum close within the next N trading
  days reaches current close * (1 + surge_pct).

Primary goal:
  Measure whether disclosure-aware horizontal stock selection improves the
  7/14/30-day surge-stock hit rate versus the daily universe baseline.
"""

from __future__ import annotations

import argparse
import json
import math
import re
import zipfile
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd


ROOT = Path("/home/openq/code/stock_app-main")
DAILY_ROOT = ROOT / "E_kosdaq_daily_wrds" / "daily_kosdaq" / "kosdaq_iqc_daily_full_history"
DAILY_PARTS_ROOT = DAILY_ROOT / "derived" / "kosdaq_common_daily_parts"
FULL_RECEIPTS_PATH = ROOT / "L_receipt_time_fullqueue" / "receipt_time_kosdaq_fullqueue_handoff_20260404" / "kosdaq_fullhistory_receipt_time_all_receipts.csv"
RECENT_RECEIPTS_PATH = ROOT / "K_receipt_time_bundle" / "receipt_time" / "kosdaq_recent1y_receipt_time_remaining_all_receipts.csv"
FULL_RECEIPT_TIMES_PATH = ROOT / "L_receipt_time_fullqueue" / "receipt_time_kosdaq_fullqueue_handoff_20260404" / "outputs" / "kosdaq_fullhistory_receipt_time_20260404_162159" / "receipt_times.csv"
RECENT_RECEIPT_TIMES_PATH = ROOT / "K_receipt_time_bundle" / "receipt_time" / "outputs" / "recent1y_split2_run" / "receipt_times.csv"
OPENDART_SPLIT1_ROOT = ROOT / "M_opendart_split1" / "opendart_kosdaq_fullhistory_split_1_by_corp" / "kosdaq_fullhistory_corpcode_split_1_documents"
OPENDART_SPLIT2_ROOT = ROOT / "N_opendart_split2" / "opendart_kosdaq_fullhistory_split_2_by_corp"
KRX_RECEIPT_BUNDLE_ROOT = ROOT / "K_krx_receipt_bundle" / "krx_rceipt"

ROUTINE_REPORT_PATTERNS = [
    "사업보고서",
    "반기보고서",
    "분기보고서",
    "감사보고서",
    "주주총회",
    "주주명부폐쇄",
    "의결권대리행사",
    "임원ㆍ주요주주특정증권등소유상황보고서",
    "주식등의대량보유상황보고서",
    "일반투자자-주식등의대량보유",
    "기업설명회(IR)개최",
    "현금ㆍ현물배당결정",
    "사외이사의선임ㆍ해임또는중도퇴임에관한신고",
    "정기주주총회결과",
    "정기주주총회결과",
    "주주총회소집공고",
]

IRREGULAR_REPORT_PATTERNS = [
    "주요사항보고서",
    "투자판단관련",
    "단일판매",
    "공급계약",
    "조회공시",
    "소송",
    "대표이사변경",
    "불성실공시",
    "특허",
    "영업정지",
    "회생절차",
    "파산",
    "관리종목",
    "상장폐지",
    "해산",
    "합병",
    "분할",
    "양수도",
    "타법인주식",
    "공정공시",
    "자율공시",
    "매출액또는손익구조",
]

MEZZANINE_REPORT_PATTERNS = [
    "전환사채",
    "신주인수권부사채",
    "교환사채",
    "유상증자",
    "사채",
]


@dataclass
class HorizonResult:
    horizon_days: int
    selector: str
    selected_stock_days: int
    baseline_stock_days: int
    selected_hit_rate: float
    baseline_hit_rate: float
    lift_vs_baseline: float
    avg_future_max_return_pct: float


def normalize_stock_code(series: pd.Series) -> pd.Series:
    return (
        pd.to_numeric(series, errors="coerce")
        .astype("Int64")
        .astype(str)
        .replace("<NA>", pd.NA)
        .str.zfill(6)
    )


def discover_krx_zip_metadata() -> list[dict[str, Any]]:
    metadata: list[dict[str, Any]] = []
    if not KRX_RECEIPT_BUNDLE_ROOT.exists():
        return metadata
    for path in sorted(KRX_RECEIPT_BUNDLE_ROOT.glob("*.zip")):
        try:
            with zipfile.ZipFile(path) as zf:
                members = zf.namelist()
                metadata.append(
                    {
                        "file": path.name,
                        "memberCount": len(members),
                        "sampleMembers": members[:5],
                    }
                )
        except Exception as exc:
            metadata.append({"file": path.name, "error": str(exc)})
    return metadata


def load_daily_history(start_date: str) -> pd.DataFrame:
    frames: list[pd.DataFrame] = []
    start_ts = pd.Timestamp(start_date)
    files = sorted(DAILY_PARTS_ROOT.glob("kosdaq_common_daily_*.parquet"))
    for file in files:
        stamp_match = re.search(r"_(\d{4})_(\d{2})\.parquet$", file.name)
        if not stamp_match:
            continue
        year = int(stamp_match.group(1))
        month = int(stamp_match.group(2))
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
    if not frames:
        return pd.DataFrame()
    df = pd.concat(frames, ignore_index=True)
    df["date"] = pd.to_datetime(df["date"])
    df = df[df["date"] >= start_ts].copy()
    df["stock_code"] = df["isin"].astype(str).str[3:9]
    df["close"] = pd.to_numeric(df["close_raw"], errors="coerce")
    df["volume"] = pd.to_numeric(df["volume_shares"], errors="coerce")
    df["dollar_volume"] = pd.to_numeric(df["dollar_volume"], errors="coerce")
    df["market_cap"] = pd.to_numeric(df["market_cap"], errors="coerce")
    df["turnover"] = pd.to_numeric(df["turnover"], errors="coerce")
    df["dollar_volume"] = df["dollar_volume"].fillna(df["close"] * df["volume"])
    df = df[
        df["is_active"].fillna(False)
        & df["stock_code"].str.fullmatch(r"\d{6}", na=False)
        & (df["close"] > 0)
        & (df["volume"] > 0)
        & (df["market_cap"] > 0)
    ].copy()
    df = df[["date", "stock_code", "ggroup", "gind", "close", "volume", "dollar_volume", "market_cap", "turnover"]]
    return df.sort_values(["stock_code", "date"]).reset_index(drop=True)


def load_aux_receipts(paths: list[Path]) -> pd.DataFrame:
    frames: list[pd.DataFrame] = []
    for path in paths:
        if not path.exists():
            continue
        try:
            frame = pd.read_csv(
                path,
                usecols=["rcept_no", "rcept_dt", "stock_code", "corp_code", "corp_name", "report_nm", "rm", "flr_nm"],
            )
        except Exception:
            continue
        frames.append(frame)
    if not frames:
        return pd.DataFrame()
    return pd.concat(frames, ignore_index=True)


def load_receipts() -> tuple[pd.DataFrame, dict[str, Any]]:
    frames: list[pd.DataFrame] = []
    metadata: dict[str, Any] = {"sources": []}

    for path, label in [
        (FULL_RECEIPTS_PATH, "full_queue"),
        (RECENT_RECEIPTS_PATH, "recent_snapshot"),
    ]:
        if not path.exists():
            continue
        frame = pd.read_csv(
            path,
            usecols=["rcept_no", "rcept_dt", "stock_code", "corp_code", "corp_name", "report_nm", "rm", "flr_nm"],
        )
        frames.append(frame)
        metadata["sources"].append({"label": label, "rows": int(len(frame)), "path": str(path)})

    aux_paths = list(OPENDART_SPLIT1_ROOT.glob("*/receipts.csv")) + list(OPENDART_SPLIT2_ROOT.glob("*/receipts.csv"))
    aux = load_aux_receipts(aux_paths)
    if not aux.empty:
        frames.append(aux)
        metadata["sources"].append({"label": "opendart_corp_receipts", "rows": int(len(aux)), "files": len(aux_paths)})

    if not frames:
        return pd.DataFrame(), metadata

    receipts = pd.concat(frames, ignore_index=True)
    receipts["rcept_no"] = receipts["rcept_no"].astype(str)
    receipts["stock_code"] = normalize_stock_code(receipts["stock_code"])
    receipts["report_nm"] = receipts["report_nm"].fillna("").astype(str)
    receipts["rcept_date"] = pd.to_datetime(receipts["rcept_dt"].astype(str), format="%Y%m%d", errors="coerce")
    receipts = receipts.dropna(subset=["stock_code", "rcept_date"]).drop_duplicates(subset=["rcept_no"])
    metadata["dedupedRows"] = int(len(receipts))
    return receipts, metadata


def load_receipt_times() -> tuple[pd.DataFrame, dict[str, Any]]:
    frames: list[pd.DataFrame] = []
    metadata: dict[str, Any] = {"sources": []}
    for path, label in [
        (RECENT_RECEIPT_TIMES_PATH, "recent_times"),
        (FULL_RECEIPT_TIMES_PATH, "full_times"),
    ]:
        if not path.exists():
            continue
        frame = pd.read_csv(path, usecols=["rcept_no", "rcept_dt", "receipt_time"])
        frame["rcept_no"] = frame["rcept_no"].astype(str)
        frame["receipt_time"] = frame["receipt_time"].astype(str).str.strip()
        frame = frame[frame["receipt_time"].str.fullmatch(r"\d{2}:\d{2}", na=False)].copy()
        frames.append(frame)
        metadata["sources"].append({"label": label, "rows": int(len(frame)), "path": str(path)})
    if not frames:
        return pd.DataFrame(), metadata
    times = pd.concat(frames, ignore_index=True).drop_duplicates(subset=["rcept_no"], keep="first")
    metadata["dedupedRows"] = int(len(times))
    return times, metadata


def assign_trade_dates(receipts: pd.DataFrame, trading_dates: pd.DatetimeIndex) -> pd.DataFrame:
    if receipts.empty:
        return receipts
    df = receipts.copy()
    left_idx = trading_dates.searchsorted(df["rcept_date"].to_numpy(), side="left")
    right_idx = trading_dates.searchsorted(df["rcept_date"].to_numpy(), side="right")
    within_left = left_idx < len(trading_dates)
    exact_match = within_left & (trading_dates.take(np.minimum(left_idx, len(trading_dates) - 1)) == df["rcept_date"].to_numpy())
    time_str = df["receipt_time"].fillna("").astype(str)
    time_valid = time_str.str.fullmatch(r"\d{2}:\d{2}")
    time_hhmm = pd.to_numeric(time_str.where(time_valid).str.replace(":", "", regex=False), errors="coerce")
    same_day_ok = time_valid & (time_hhmm <= 1530)
    assigned_idx = np.where(same_day_ok.to_numpy() & exact_match, left_idx, np.where(exact_match, right_idx, left_idx))
    valid = assigned_idx < len(trading_dates)
    df = df.loc[valid].copy()
    df["trade_date"] = trading_dates.take(assigned_idx[valid]).to_numpy()
    return df


def classify_receipts(receipts: pd.DataFrame) -> pd.DataFrame:
    df = receipts.copy()
    report = df["report_nm"].fillna("")
    routine_regex = "|".join(re.escape(item) for item in ROUTINE_REPORT_PATTERNS)
    irregular_regex = "|".join(re.escape(item) for item in IRREGULAR_REPORT_PATTERNS)
    mezzanine_regex = "|".join(re.escape(item) for item in MEZZANINE_REPORT_PATTERNS)
    df["is_routine"] = report.str.contains(routine_regex, regex=True, na=False)
    df["is_irregular"] = report.str.contains(irregular_regex, regex=True, na=False) | ~df["is_routine"]
    df["is_mezzanine"] = report.str.contains(mezzanine_regex, regex=True, na=False)
    return df


def aggregate_disclosure_daily(receipts: pd.DataFrame) -> pd.DataFrame:
    if receipts.empty:
        return pd.DataFrame(columns=["stock_code", "date", "receipt_count_1d", "irregular_count_1d", "mezzanine_count_1d"])
    grouped = (
        receipts.groupby(["stock_code", "trade_date"], sort=False)
        .agg(
            receipt_count_1d=("rcept_no", "size"),
            irregular_count_1d=("is_irregular", "sum"),
            mezzanine_count_1d=("is_mezzanine", "sum"),
        )
        .reset_index()
        .rename(columns={"trade_date": "date"})
    )
    return grouped


def safe_divide(num: pd.Series, denom: pd.Series, floor: float) -> pd.Series:
    return num / denom.clip(lower=floor)


def add_price_features(df: pd.DataFrame) -> pd.DataFrame:
    stock = df.groupby("stock_code", sort=False)
    df = df.copy()
    prev_close_max20 = stock["close"].shift(1).rolling(20, min_periods=10).max()
    df["ret_5d"] = stock["close"].pct_change(5)
    df["ret_20d"] = stock["close"].pct_change(20)
    df["volume_avg20"] = stock["volume"].shift(1).rolling(20, min_periods=10).mean()
    df["dollar_volume_avg20"] = stock["dollar_volume"].shift(1).rolling(20, min_periods=10).mean()
    df["turnover_avg20"] = stock["turnover"].shift(1).rolling(20, min_periods=10).mean()
    df["volume_ratio20"] = safe_divide(df["volume"], df["volume_avg20"], 1.0)
    df["dollar_volume_ratio20"] = safe_divide(df["dollar_volume"], df["dollar_volume_avg20"], 1.0)
    df["turnover_ratio20"] = safe_divide(df["turnover"], df["turnover_avg20"], 1e-6)
    df["close_to_prev_20d_high"] = safe_divide(df["close"], prev_close_max20, 1.0) - 1
    df["breakout_20d"] = (df["close"] > prev_close_max20).astype(float)
    df["liquidity_log"] = np.log1p(df["dollar_volume"].clip(lower=0))
    return df


def add_disclosure_features(df: pd.DataFrame) -> pd.DataFrame:
    stock = df.groupby("stock_code", sort=False)
    df = df.copy()
    for col, windows in {
        "receipt_count_1d": [7, 14, 30],
        "irregular_count_1d": [7, 14, 30],
        "mezzanine_count_1d": [30],
    }.items():
        for window in windows:
            df[f"{col[:-3]}_{window}d"] = stock[col].shift(0).rolling(window, min_periods=1).sum()
    df["receipt_baseline_60d"] = stock["receipt_count_1d"].shift(1).rolling(60, min_periods=20).mean()
    df["irregular_baseline_60d"] = stock["irregular_count_1d"].shift(1).rolling(60, min_periods=20).mean()
    df["mezzanine_baseline_180d"] = stock["mezzanine_count_1d"].shift(1).rolling(180, min_periods=40).mean()
    df["receipt_burst_7d"] = safe_divide(df["receipt_count_7d"], df["receipt_baseline_60d"] * 7, 0.5)
    df["receipt_burst_30d"] = safe_divide(df["receipt_count_30d"], df["receipt_baseline_60d"] * 30, 1.0)
    df["irregular_burst_14d"] = safe_divide(df["irregular_count_14d"], df["irregular_baseline_60d"] * 14, 0.25)
    df["mezzanine_burst_30d"] = safe_divide(df["mezzanine_count_30d"], df["mezzanine_baseline_180d"] * 30, 0.25)
    df["receipt_eventfulness"] = np.log1p(df["receipt_count_7d"]) * np.log1p(df["receipt_burst_7d"])
    df["irregular_eventfulness"] = np.log1p(df["irregular_count_14d"]) * np.log1p(df["irregular_burst_14d"])
    df["mezzanine_eventfulness"] = np.log1p(df["mezzanine_count_30d"]) * np.log1p(df["mezzanine_burst_30d"])
    return df


def future_max_returns(df: pd.DataFrame, horizons: list[int]) -> pd.DataFrame:
    out = df.copy()
    for horizon in horizons:
        future_max = (
            out.groupby("stock_code", group_keys=False)["close"]
            .apply(lambda s: s.shift(-1).iloc[::-1].rolling(horizon, min_periods=1).max().iloc[::-1])
        )
        out[f"future_max_return_{horizon}d"] = future_max / out["close"] - 1
    return out


def add_cross_sectional_scores(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    features = {
        "volume_ratio20": "rank_volume_ratio20",
        "dollar_volume_ratio20": "rank_dollar_volume_ratio20",
        "turnover_ratio20": "rank_turnover_ratio20",
        "ret_20d": "rank_ret_20d",
        "close_to_prev_20d_high": "rank_breakout_proximity",
        "liquidity_log": "rank_liquidity",
        "receipt_eventfulness": "rank_receipt_eventfulness",
        "irregular_eventfulness": "rank_irregular_eventfulness",
        "mezzanine_eventfulness": "rank_mezzanine_eventfulness",
    }
    for source, target in features.items():
        out[target] = out.groupby("date")[source].rank(pct=True)

    out["base_selector_score"] = (
        0.28 * out["rank_dollar_volume_ratio20"].fillna(0)
        + 0.22 * out["rank_volume_ratio20"].fillna(0)
        + 0.18 * out["rank_turnover_ratio20"].fillna(0)
        + 0.18 * out["rank_breakout_proximity"].fillna(0)
        + 0.08 * out["rank_ret_20d"].fillna(0)
        + 0.06 * out["rank_liquidity"].fillna(0)
    )
    out["disclosure_selector_score"] = (
        0.45 * out["rank_receipt_eventfulness"].fillna(0)
        + 0.35 * out["rank_irregular_eventfulness"].fillna(0)
        + 0.20 * out["rank_mezzanine_eventfulness"].fillna(0)
    )
    out["combined_selector_score"] = 0.68 * out["base_selector_score"] + 0.32 * out["disclosure_selector_score"]
    return out


def evaluate_selector(
    df: pd.DataFrame,
    selector_col: str,
    horizons: list[int],
    surge_pct: float,
    top_k: int,
) -> list[HorizonResult]:
    results: list[HorizonResult] = []
    for horizon in horizons:
        future_col = f"future_max_return_{horizon}d"
        eligible = df[
            df[selector_col].notna()
            & df[future_col].notna()
            & df["volume_ratio20"].notna()
            & (df["dollar_volume"] >= 500_000_000)
            & (df["market_cap"] >= 20_000_000_000)
        ].copy()
        if eligible.empty:
            results.append(
                HorizonResult(horizon, selector_col, 0, 0, 0.0, 0.0, 0.0, 0.0)
            )
            continue
        eligible["hit"] = eligible[future_col] >= surge_pct
        baseline_hit_rate = float(eligible["hit"].mean())
        selected = (
            eligible.sort_values(["date", selector_col], ascending=[True, False])
            .groupby("date", sort=False)
            .head(top_k)
            .copy()
        )
        selected_hit_rate = float(selected["hit"].mean()) if len(selected) else 0.0
        lift = selected_hit_rate / baseline_hit_rate if baseline_hit_rate > 0 else 0.0
        avg_future_return = float(selected[future_col].mean() * 100) if len(selected) else 0.0
        results.append(
            HorizonResult(
                horizon_days=horizon,
                selector=selector_col,
                selected_stock_days=int(len(selected)),
                baseline_stock_days=int(len(eligible)),
                selected_hit_rate=selected_hit_rate,
                baseline_hit_rate=baseline_hit_rate,
                lift_vs_baseline=lift,
                avg_future_max_return_pct=avg_future_return,
            )
        )
    return results


def selector_summary(results: list[HorizonResult]) -> dict[str, Any]:
    if not results:
        return {}
    selector_name = results[0].selector
    return {
        selector_name: {
            f"{item.horizon_days}d": {
                "selectedStockDays": item.selected_stock_days,
                "baselineStockDays": item.baseline_stock_days,
                "selectedHitRate": round(item.selected_hit_rate, 4),
                "baselineHitRate": round(item.baseline_hit_rate, 4),
                "liftVsBaseline": round(item.lift_vs_baseline, 2),
                "avgFutureMaxReturnPct": round(item.avg_future_max_return_pct, 2),
            }
            for item in results
        }
    }


def compute_report_examples(receipts: pd.DataFrame) -> dict[str, list[str]]:
    report = receipts["report_nm"].fillna("")
    examples = {}
    for label, patterns in [
        ("mezzanine", MEZZANINE_REPORT_PATTERNS),
        ("irregular", IRREGULAR_REPORT_PATTERNS),
    ]:
        regex = "|".join(re.escape(item) for item in patterns)
        counts = report[report.str.contains(regex, regex=True, na=False)].value_counts().head(10)
        examples[label] = counts.index.tolist()
    return examples


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--start-date", default="2000-03-01")
    parser.add_argument("--surge-pct", type=float, default=0.30, help="Future close surge threshold, e.g. 0.30 = +30%%")
    parser.add_argument("--top-k", type=int, default=50, help="Top ranked names per trading day")
    parser.add_argument("--horizons", default="7,14,30", help="Comma separated trading-day horizons")
    parser.add_argument("--out", default="public/data/kosdaq-horizontal-disclosure-backtest.json")
    args = parser.parse_args()

    horizons = [int(token.strip()) for token in args.horizons.split(",") if token.strip()]

    daily = load_daily_history(args.start_date)
    if daily.empty:
        raise SystemExit("No daily history loaded")
    trading_dates = pd.DatetimeIndex(sorted(daily["date"].drop_duplicates().tolist()))

    receipts, receipts_meta = load_receipts()
    times, times_meta = load_receipt_times()
    if not times.empty:
        receipts = receipts.merge(times[["rcept_no", "receipt_time"]], on="rcept_no", how="left")
    else:
        receipts["receipt_time"] = pd.NA
    receipts = classify_receipts(receipts)
    receipts = assign_trade_dates(receipts, trading_dates)
    disclosure_daily = aggregate_disclosure_daily(receipts)

    dataset = daily.merge(disclosure_daily, on=["stock_code", "date"], how="left")
    for col in ["receipt_count_1d", "irregular_count_1d", "mezzanine_count_1d"]:
        dataset[col] = dataset[col].fillna(0.0)

    dataset = add_price_features(dataset)
    dataset = add_disclosure_features(dataset)
    dataset = future_max_returns(dataset, horizons)
    dataset = add_cross_sectional_scores(dataset)

    all_results: list[HorizonResult] = []
    for selector_col in ["base_selector_score", "disclosure_selector_score", "combined_selector_score"]:
        all_results.extend(evaluate_selector(dataset, selector_col, horizons, args.surge_pct, args.top_k))

    summary: dict[str, Any] = {}
    for selector_col in ["base_selector_score", "disclosure_selector_score", "combined_selector_score"]:
        selector_results = [item for item in all_results if item.selector == selector_col]
        summary.update(selector_summary(selector_results))

    output = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "universe": "KOSDAQ common stocks",
        "startDate": args.start_date,
        "topKPerDay": args.top_k,
        "surgePct": args.surge_pct,
        "horizons": horizons,
        "dataSources": {
            "dailyWrds": str(DAILY_ROOT),
            "receiptsMeta": receipts_meta,
            "receiptTimesMeta": times_meta,
            "krxReceiptBundleMeta": discover_krx_zip_metadata(),
            "opendartSplit1Dirs": len(list(OPENDART_SPLIT1_ROOT.glob("*"))),
            "opendartSplit2Dirs": len(list(OPENDART_SPLIT2_ROOT.glob("*"))),
        },
        "coverage": {
            "dailyRows": int(len(daily)),
            "dailyStocks": int(daily["stock_code"].nunique()),
            "receiptRows": int(len(receipts)),
            "receiptStocks": int(receipts["stock_code"].nunique()),
            "timeCoveragePct": round(100 * receipts["receipt_time"].notna().mean(), 2),
        },
        "classificationExamples": compute_report_examples(receipts),
        "results": summary,
    }

    out_path = ROOT / args.out
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(output, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
