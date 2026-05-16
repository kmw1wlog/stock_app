from __future__ import annotations

import json
import os
import tempfile
import unittest
from pathlib import Path

from linux_1m_api_handoff_20260515.kis_linux_1m_poller import KisMinutePoller, build_config
from linux_1m_api_handoff_20260515.realtime_signal_engine import run_once


ROOT = Path("/home/openq/code/stock_app-main")


class KisLivePipelineTest(unittest.TestCase):
    def test_live_kis_pipeline_smoke(self) -> None:
        required = ["KIS_ENV", "KIS_APP_KEY", "KIS_APP_SECRET"]
        missing = [key for key in required if not os.environ.get(key)]
        if missing:
            self.skipTest(f"missing env vars: {', '.join(missing)}")

        with tempfile.TemporaryDirectory() as tmpdir:
            tmp = Path(tmpdir)
            selector_json = tmp / "selector.json"
            alerts_json = tmp / "alerts.json"
            out_dir = tmp / "out"

            # Use a small active symbol basket for live smoke. These are stable
            # large-cap KR symbols that exist in paper quotations.
            selector_payload = {
                "generatedAt": "2026-05-16T00:00:00+00:00",
                "tradeDate": "2026-05-15",
                "selector": "live_smoke_selector",
                "topK": 2,
                "candidateCount": 2,
                "candidates": [
                    {"symbol": "005930", "date": "2026-05-15", "selector_score": 0.95, "reasons": ["라이브 테스트"], "features": {}},
                    {"symbol": "000660", "date": "2026-05-15", "selector_score": 0.94, "reasons": ["라이브 테스트"], "features": {}},
                ],
            }
            selector_json.write_text(json.dumps(selector_payload, ensure_ascii=False, indent=2), encoding="utf-8")

            poller = KisMinutePoller(build_config())
            symbols = [item["symbol"] for item in selector_payload["candidates"]]
            fetched: dict[str, list[dict[str, object]]] = {}
            try:
                for symbol in symbols:
                    fetched[symbol] = poller.fetch_recent_minutes(symbol, 120)
            except Exception as exc:
                self.skipTest(f"KIS upstream unavailable for automated live smoke: {exc}")

            symbols_with_bars = sum(1 for rows in fetched.values() if rows)
            self.assertGreater(symbols_with_bars, 0, "expected live KIS minute bars to be fetched")

            fixture_jsonl = tmp / "live_bars.jsonl"
            with fixture_jsonl.open("w", encoding="utf-8") as handle:
                for rows in fetched.values():
                    for row in rows:
                        handle.write(json.dumps(row, ensure_ascii=False) + "\n")

            alerts_payload = {"alerts": []}
            alerts_json.write_text(json.dumps(alerts_payload, ensure_ascii=False, indent=2), encoding="utf-8")

            summary = run_once(
                source="fixture",
                selector_json=selector_json,
                out_dir=out_dir,
                fixture_jsonl=fixture_jsonl,
                lookback_minutes=120,
                min_amount=1_000_000,
                cooldown_bars=30,
                trigger_window_bars=120,
                default_market_return_pct=-0.5,
                alerts_json=alerts_json,
                symbols_override=symbols,
            )
            self.assertGreater(summary["symbolsWithBars"], 0)
            signals_payload = json.loads((out_dir / "formula_signals_latest.json").read_text(encoding="utf-8"))
            self.assertIn("signals", signals_payload)
            self.assertTrue((out_dir / "alert_triggers_latest.json").exists())


if __name__ == "__main__":
    unittest.main()
