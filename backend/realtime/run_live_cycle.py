#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from linux_1m_api_handoff_20260515.realtime_signal_engine import build_selector_snapshot, run_once, write_json


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run one integrated live backend cycle for the frontend app.")
    parser.add_argument("--source", choices=["fixture", "kis"], default="fixture")
    parser.add_argument("--selector", default="base_selector_score")
    parser.add_argument("--top-k", type=int, default=20)
    parser.add_argument("--start-date", default="2000-03-01")
    parser.add_argument("--target-date")
    parser.add_argument("--fixture-jsonl")
    parser.add_argument("--alerts-json")
    parser.add_argument("--out-dir", default=str(ROOT / "runtime_output" / "realtime_signals"))
    parser.add_argument("--lookback-minutes", type=int, default=120)
    parser.add_argument("--min-amount", type=float, default=2_000_000_000)
    parser.add_argument("--cooldown-bars", type=int, default=30)
    parser.add_argument("--trigger-window-bars", type=int, default=3)
    parser.add_argument("--default-market-return-pct", type=float, default=0.0)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    out_dir = Path(args.out_dir).resolve()
    selector_json = out_dir / "daily_selector_latest.json"
    selector_payload = build_selector_snapshot(
        selector=args.selector,
        top_k=args.top_k,
        start_date=args.start_date,
        target_date=args.target_date,
    )
    write_json(selector_json, selector_payload)

    summary = run_once(
        source=args.source,
        selector_json=selector_json,
        out_dir=out_dir,
        fixture_jsonl=Path(args.fixture_jsonl).resolve() if args.fixture_jsonl else None,
        lookback_minutes=args.lookback_minutes,
        min_amount=args.min_amount,
        cooldown_bars=args.cooldown_bars,
        trigger_window_bars=args.trigger_window_bars,
        default_market_return_pct=args.default_market_return_pct,
        alerts_json=Path(args.alerts_json).resolve() if args.alerts_json else None,
        symbols_override=None,
    )
    print(json.dumps({"ok": True, "selectorPath": str(selector_json), **summary}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
