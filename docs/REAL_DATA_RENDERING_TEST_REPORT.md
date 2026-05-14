# Real Data Rendering Test Report

## Environment

- Date: 2026-05-14
- Branch: `feature/api-key-runtime-verification`
- App version: `0.5.0-live-data`
- Database: not configured locally for this run

## Public Provider Smoke Test

`npm run data:smoke` succeeded with at least one keyless public provider. All three checked providers returned data:

| Provider | Endpoint | Result |
|---|---|---|
| Binance | `https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT` | HTTP 200, BTCUSDT live price/change/volume returned. |
| Upbit | `https://api.upbit.com/v1/ticker?markets=KRW-BTC` | HTTP 200, KRW-BTC live price/change/volume returned. |
| Alternative Fear & Greed | `https://api.alternative.me/fng/?limit=1` | HTTP 200, value/classification returned. |

## Rendering Path

- When the database is unavailable or empty, `/api/cards/feed` attempts real public crypto providers before considering mock mode.
- In `DATA_MODE=live`, mock cards are not returned unless mock mode is explicitly enabled.
- Public crypto cards include `dataBasisLabel`, `source`, `updatedAt`, `price`, `changePct`, `volume`, and `isMock: false`.

## UI Verification

| Page | Data Source | Status | Notes |
|---|---|---|---|
| Home | `/api/cards/feed` | implemented | Shows live public crypto cards or an honest empty state. |
| Data status | `/api/provider-status` | implemented | Shows provider state and missing env. |
| Rankings/report | DB/provider APIs | implemented policy | Uses data APIs and no premium/user-behavior copy. |

`npm run data:verify-render` passed against `http://localhost:3000`; the feed returned 7 live cards with `isMock: false`.

`POST /api/admin/refresh-all` was also called locally with `Authorization: Bearer CRON_SECRET`; it returned `ok: true` and 10 job results.

Additional cards now render from configured API keys:

- Data.go.kr: Samsung Electronics EOD price/change/volume/amount.
- Alpaca: Apple daily snapshot.
- Naver News: Samsung Electronics news title/link basis.

## Banned Copy Verification

`npm run check:banned-copy` passed for `src/app`, `src/components`, `src/lib`, and `src/context`.

## Known Gaps

- DB-backed persistence for KR EOD, OpenDART, Naver, SEC, and KRX requires deployment env and database migration.
- US direct price API is optional. If disabled, US price/rate/chart must be shown through TradingView widgets only.
- KRX short/flow labels are not shown until verified with official API access.
