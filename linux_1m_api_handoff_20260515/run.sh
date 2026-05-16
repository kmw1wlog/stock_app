#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [[ -f .env ]]; then
  set -a
  source .env
  set +a
fi

MODE="${1:-once}"
SYMBOLS="${2:-005930}"

python3 kis_linux_1m_poller.py \
  --mode "$MODE" \
  --symbols "$SYMBOLS"
