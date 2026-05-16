from __future__ import annotations

import argparse
import csv
import json
import os
import random
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import requests


KST = timezone(timedelta(hours=9))


def now_kst() -> datetime:
    return datetime.now(KST)


def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip("\"").strip("'")
        os.environ.setdefault(key, value)


@dataclass
class KisConfig:
    app_key: str
    app_secret: str
    base_url: str
    minute_endpoint: str
    minute_tr_id: str
    market_div_code: str
    poll_seconds: int
    lookback_minutes: int
    output_dir: Path


class KisMinutePoller:
    def __init__(self, config: KisConfig) -> None:
        self.config = config
        self.session = requests.Session()
        self.session.headers.update(
            {
                "content-type": "application/json; charset=utf-8",
                "appkey": config.app_key,
                "appsecret": config.app_secret,
                "custtype": "P",
            }
        )
        self._access_token: str | None = None
        self._token_expires_at: datetime | None = None

    def ensure_token(self) -> str:
        if self._access_token and self._token_expires_at and self._token_expires_at > now_kst() + timedelta(minutes=5):
            return self._access_token

        payload = {
            "grant_type": "client_credentials",
            "appkey": self.config.app_key,
            "appsecret": self.config.app_secret,
        }
        last_error: Exception | None = None
        data: dict[str, Any] | None = None
        for attempt in range(3):
            try:
                resp = self.session.post(
                    f"{self.config.base_url}/oauth2/tokenP",
                    data=json.dumps(payload),
                    timeout=20,
                )
                resp.raise_for_status()
                data = resp.json()
                break
            except Exception as exc:
                last_error = exc
                if attempt == 2:
                    raise
                time.sleep(0.4 * (attempt + 1) + random.random() * 0.2)
        if data is None:
            if last_error:
                raise last_error
            raise RuntimeError("token request failed without response data")
        access_token = str(data.get("access_token") or "").strip()
        if not access_token:
            raise RuntimeError(f"missing access_token in response: {data}")
        expires_raw = str(data.get("access_token_token_expired") or "").strip()
        if expires_raw:
            expires_at = datetime.strptime(expires_raw, "%Y-%m-%d %H:%M:%S").replace(tzinfo=KST)
        else:
            expires_at = now_kst() + timedelta(hours=24)
        self._access_token = access_token
        self._token_expires_at = expires_at
        return access_token

    def fetch_minute_page(self, symbol: str, end_hhmmss: str) -> list[dict[str, Any]]:
        headers = {
            "tr_id": self.config.minute_tr_id,
            "custtype": "P",
        }
        params = {
            "FID_ETC_CLS_CODE": "",
            "FID_COND_MRKT_DIV_CODE": self.config.market_div_code,
            "FID_INPUT_ISCD": symbol,
            "FID_INPUT_HOUR_1": end_hhmmss,
            "FID_PW_DATA_INCU_YN": "N",
        }
        last_error: Exception | None = None
        data: dict[str, Any] | None = None
        for attempt in range(3):
            try:
                token = self.ensure_token()
                request_headers = {
                    **headers,
                    "authorization": f"Bearer {token}",
                }
                resp = self.session.get(
                    f"{self.config.base_url}{self.config.minute_endpoint}",
                    headers=request_headers,
                    params=params,
                    timeout=20,
                )
                resp.raise_for_status()
                data = resp.json()
                break
            except Exception as exc:
                last_error = exc
                self._access_token = None
                self._token_expires_at = None
                if attempt == 2:
                    raise
                time.sleep(0.35 * (attempt + 1) + random.random() * 0.2)
        if data is None:
            if last_error:
                raise last_error
            raise RuntimeError("minute page request failed without response data")
        if str(data.get("rt_cd", "0")) not in {"0", ""}:
            raise RuntimeError(f"KIS error: {data}")
        rows = data.get("output2") or []
        return list(rows)

    def fetch_recent_minutes(self, symbol: str, lookback_minutes: int) -> list[dict[str, Any]]:
        remaining = max(lookback_minutes, 1)
        end_time = now_kst().replace(second=0, microsecond=0)
        all_rows: list[dict[str, Any]] = []
        seen: set[str] = set()

        while remaining > 0:
            rows = self.fetch_minute_page(symbol, end_time.strftime("%H%M%S"))
            if not rows:
                break
            for row in rows:
                dt_key = f"{row.get('stck_bsop_date','')}{row.get('stck_cntg_hour','')}"
                if dt_key in seen:
                    continue
                seen.add(dt_key)
                all_rows.append(row)
            end_time -= timedelta(minutes=len(rows))
            remaining -= len(rows)
            if len(rows) < 30:
                break
            time.sleep(0.15)

        normalized = [self.normalize_bar(symbol, row) for row in all_rows]
        normalized.sort(key=lambda x: x["bar_time_kst"])
        return normalized

    @staticmethod
    def normalize_bar(symbol: str, row: dict[str, Any]) -> dict[str, Any]:
        date_text = str(row.get("stck_bsop_date") or "")
        time_text = str(row.get("stck_cntg_hour") or "").zfill(6)
        bar_dt = datetime.strptime(date_text + time_text, "%Y%m%d%H%M%S").replace(tzinfo=KST)
        return {
            "symbol": symbol,
            "bar_time_kst": bar_dt.isoformat(),
            "open": float(row.get("stck_oprc") or 0),
            "high": float(row.get("stck_hgpr") or 0),
            "low": float(row.get("stck_lwpr") or 0),
            "close": float(row.get("stck_prpr") or 0),
            "volume": float(row.get("cntg_vol") or 0),
            "raw": row,
        }

    def write_outputs(self, rows: list[dict[str, Any]]) -> None:
        self.config.output_dir.mkdir(parents=True, exist_ok=True)
        stamp = now_kst().strftime("%Y%m%d_%H%M%S")
        jsonl_path = self.config.output_dir / f"minute_bars_{stamp}.jsonl"
        csv_path = self.config.output_dir / "minute_bars_latest.csv"

        with jsonl_path.open("w", encoding="utf-8", newline="\n") as handle:
            for row in rows:
                handle.write(json.dumps(row, ensure_ascii=False))
                handle.write("\n")

        with csv_path.open("w", encoding="utf-8", newline="") as handle:
            writer = csv.DictWriter(
                handle,
                fieldnames=["symbol", "bar_time_kst", "open", "high", "low", "close", "volume"],
            )
            writer.writeheader()
            for row in rows:
                writer.writerow(
                    {
                        "symbol": row["symbol"],
                        "bar_time_kst": row["bar_time_kst"],
                        "open": row["open"],
                        "high": row["high"],
                        "low": row["low"],
                        "close": row["close"],
                        "volume": row["volume"],
                    }
                )


def build_config() -> KisConfig:
    env = os.environ.get("KIS_ENV", "real").strip().lower()
    if env == "paper":
        default_base_url = "https://openapivts.koreainvestment.com:29443"
    else:
        default_base_url = "https://openapi.koreainvestment.com:9443"

    app_key = os.environ.get("KIS_APP_KEY", "").strip()
    app_secret = os.environ.get("KIS_APP_SECRET", "").strip()
    if not app_key or not app_secret:
        raise RuntimeError("KIS_APP_KEY and KIS_APP_SECRET are required")

    return KisConfig(
        app_key=app_key,
        app_secret=app_secret,
        base_url=os.environ.get("KIS_BASE_URL", default_base_url).strip() or default_base_url,
        minute_endpoint=os.environ.get(
            "KIS_MINUTE_ENDPOINT",
            "/uapi/domestic-stock/v1/quotations/inquire-time-itemchartprice",
        ).strip(),
        minute_tr_id=os.environ.get("KIS_MINUTE_TR_ID", "FHKST03010200").strip(),
        market_div_code=os.environ.get("KIS_MARKET_DIV_CODE", "J").strip(),
        poll_seconds=int(os.environ.get("POLL_SECONDS", "60")),
        lookback_minutes=int(os.environ.get("LOOKBACK_MINUTES", "120")),
        output_dir=Path(os.environ.get("OUTPUT_DIR", "./output")).resolve(),
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="KIS Linux 1-minute bar poller")
    parser.add_argument("--mode", choices=["once", "loop"], default="once")
    parser.add_argument("--symbols", required=True, help="Comma-separated KRX codes, e.g. 005930,000660")
    parser.add_argument("--lookback-minutes", type=int, default=0, help="Override LOOKBACK_MINUTES")
    return parser.parse_args()


def main() -> int:
    base_dir = Path(__file__).resolve().parent
    load_env_file(base_dir / ".env")
    args = parse_args()
    config = build_config()
    if args.lookback_minutes > 0:
        config.lookback_minutes = args.lookback_minutes

    poller = KisMinutePoller(config)
    symbols = [s.strip() for s in args.symbols.split(",") if s.strip()]
    if not symbols:
        raise RuntimeError("at least one symbol is required")

    while True:
        collected: list[dict[str, Any]] = []
        for symbol in symbols:
            try:
                collected.extend(poller.fetch_recent_minutes(symbol, config.lookback_minutes))
            except Exception as exc:
                print(f"[ERROR] symbol={symbol} {exc}", file=sys.stderr)
        if collected:
            poller.write_outputs(collected)
            print(f"[INFO] wrote {len(collected)} rows at {now_kst().isoformat()}")
        if args.mode == "once":
            break
        time.sleep(max(config.poll_seconds, 1))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
