from __future__ import annotations

import json
import subprocess
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path


ROOT = Path("/home/openq/code/stock_app-main")
ENGINE = ROOT / "linux_1m_api_handoff_20260515" / "realtime_signal_engine.py"
KST = timezone(timedelta(hours=9))


def make_bar(symbol: str, dt: datetime, price: float, high: float, low: float, close: float, volume: float) -> dict[str, object]:
    return {
        "symbol": symbol,
        "bar_time_kst": dt.isoformat(),
        "open": price,
        "high": high,
        "low": low,
        "close": close,
        "volume": volume,
    }


def build_fixture_rows() -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    symbol = "123456"
    other = "654321"
    base_day = datetime(2026, 5, 1, 9, 0, tzinfo=KST)

    # Ten quiet baseline days so rolling 20-day proxies have enough history.
    for day_offset in range(10):
        day_start = base_day + timedelta(days=day_offset)
        close = 100.0
        for minute in range(10):
            dt = day_start + timedelta(minutes=minute)
            rows.append(make_bar(symbol, dt, close, close + 0.2, close - 0.2, close, 1000))
            rows.append(make_bar(other, dt, 80.0, 80.1, 79.9, 80.0, 700))

    # Previous day: strong bullish candle with heavy volume.
    prev_day_start = base_day + timedelta(days=10)
    prev_prices = [100, 101, 102, 103, 105, 106, 107, 108, 109, 111]
    for minute, close in enumerate(prev_prices):
        dt = prev_day_start + timedelta(minutes=minute)
        rows.append(make_bar(symbol, dt, close - 0.3, close + 0.5, close - 0.5, close, 8000))
        rows.append(make_bar(other, dt, 81.0, 81.1, 80.8, 81.0, 700))

    # Current day: gap hold + heavy volume + continued strength.
    current_day_start = base_day + timedelta(days=11)
    current_prices = [114, 115, 116, 117, 118, 119, 120, 121, 122, 123]
    for minute, close in enumerate(current_prices):
        dt = current_day_start + timedelta(minutes=minute)
        rows.append(make_bar(symbol, dt, close - 0.4, close + 0.6, close - 0.5, close, 12000))
        rows.append(make_bar(other, dt, 81.0, 81.2, 80.9, 81.1, 600))

    return rows


class RealtimeSignalEngineTest(unittest.TestCase):
    def test_fixture_pipeline_generates_signals_and_alert_trigger(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            tmp = Path(tmpdir)
            selector_json = tmp / "selector.json"
            fixture_jsonl = tmp / "bars.jsonl"
            alerts_json = tmp / "alerts.json"
            out_dir = tmp / "out"

            selector_payload = {
                "generatedAt": "2026-05-16T00:00:00+00:00",
                "tradeDate": "2026-05-12",
                "selector": "base_selector_score",
                "topK": 50,
                "candidateCount": 1,
                "candidates": [
                    {
                        "symbol": "123456",
                        "date": "2026-05-12",
                        "selector_score": 0.97,
                        "reasons": ["일봉 거래량 4.2배", "거래대금 3.8배"],
                        "features": {},
                    }
                ],
            }
            selector_json.write_text(json.dumps(selector_payload, ensure_ascii=False, indent=2), encoding="utf-8")

            with fixture_jsonl.open("w", encoding="utf-8") as handle:
                for row in build_fixture_rows():
                    handle.write(json.dumps(row, ensure_ascii=False) + "\n")

            alerts_payload = {
                "alerts": [
                    {
                        "id": "alert-1",
                        "anonUserId": "user-1",
                        "cardKey": "card-123456",
                        "assetKey": "KR:123456",
                        "symbol": "123456",
                        "formulaKey": "A_volume_spike",
                        "status": "active",
                    }
                ]
            }
            alerts_json.write_text(json.dumps(alerts_payload, ensure_ascii=False, indent=2), encoding="utf-8")

            cmd = [
                "python3",
                str(ENGINE),
                "run-once",
                "--source",
                "fixture",
                "--selector-json",
                str(selector_json),
                "--fixture-jsonl",
                str(fixture_jsonl),
                "--alerts-json",
                str(alerts_json),
                "--out-dir",
                str(out_dir),
                "--min-amount",
                "1000000",
                "--cooldown-bars",
                "2",
                "--trigger-window-bars",
                "20",
                "--default-market-return-pct",
                "-2.0",
            ]
            completed = subprocess.run(cmd, cwd=ROOT, check=True, capture_output=True, text=True)
            self.assertIn('"ok": true', completed.stdout.lower())

            signals_payload = json.loads((out_dir / "formula_signals_latest.json").read_text(encoding="utf-8"))
            triggers_payload = json.loads((out_dir / "alert_triggers_latest.json").read_text(encoding="utf-8"))
            live_feed_payload = json.loads((out_dir / "frontend" / "live-feed.json").read_text(encoding="utf-8"))

            signal_keys = {(item["symbol"], item["formula_key"]) for item in signals_payload["signals"]}
            self.assertIn(("123456", "A_volume_spike"), signal_keys)
            self.assertIn(("123456", "F_follow_through"), signal_keys)
            self.assertGreaterEqual(triggers_payload["matchedTriggerCount"], 1)
            self.assertEqual(triggers_payload["triggers"][0]["formulaKey"], "A_volume_spike")
            self.assertEqual(triggers_payload["triggers"][0]["metadata"]["deliveryStatus"], "pending")
            self.assertGreaterEqual(len(live_feed_payload["items"]), 1)
            self.assertEqual(live_feed_payload["items"][0]["source"], "realtime-backend")


if __name__ == "__main__":
    unittest.main()
