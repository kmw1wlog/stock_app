#!/usr/bin/env python3
"""Live KIS smoke test for realtime selector/minute alert backend.

This script is intentionally separate from unittest so we can run a real
provider smoke with credentials in the shell environment, while keeping CI-like
tests deterministic.
"""

from __future__ import annotations

import json
import sys
import tempfile
from pathlib import Path

ROOT = Path("/home/openq/code/stock_app-main")
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from linux_1m_api_handoff_20260515.kis_linux_1m_poller import KisMinutePoller, build_config
from linux_1m_api_handoff_20260515.realtime_signal_engine import run_once


def main() -> int:
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp = Path(tmpdir)
        selector_json = tmp / "selector.json"
        alerts_json = tmp / "alerts.json"
        out_dir = tmp / "out"

        selector_payload = {
            "generatedAt": "2026-05-16T00:00:00+00:00",
            "tradeDate": "2026-05-15",
            "selector": "live_smoke_selector",
            "topK": 2,
            "candidateCount": 2,
            "candidates": [
                {"symbol": "049080", "date": "2026-05-15", "selector_score": 0.99, "reasons": ["라이브 테스트"], "features": {}},
                {"symbol": "033790", "date": "2026-05-15", "selector_score": 0.98, "reasons": ["라이브 테스트"], "features": {}},
            ],
        }
        selector_json.write_text(json.dumps(selector_payload, ensure_ascii=False, indent=2), encoding="utf-8")
        alerts_json.write_text(json.dumps({"alerts": []}, ensure_ascii=False, indent=2), encoding="utf-8")

        poller = KisMinutePoller(build_config())
        symbols = [item["symbol"] for item in selector_payload["candidates"]]
        fetched: dict[str, list[dict[str, object]]] = {}
        for symbol in symbols:
            fetched[symbol] = poller.fetch_recent_minutes(symbol, 120)

        symbols_with_bars = sum(1 for rows in fetched.values() if rows)
        if symbols_with_bars == 0:
            raise SystemExit("no live minute bars fetched")

        fixture_jsonl = tmp / "live_bars.jsonl"
        with fixture_jsonl.open("w", encoding="utf-8") as handle:
            for rows in fetched.values():
                for row in rows:
                    handle.write(json.dumps(row, ensure_ascii=False) + "\n")

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

        payload = {
            "liveSymbols": symbols,
            "symbolsWithBars": symbols_with_bars,
            "summary": summary,
        }
        print(json.dumps(payload, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
