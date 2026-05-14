# API Runtime Test Report

## Environment

- Date: 2026-05-14
- Branch: `feature/v0.5.0-live-data`
- DATA_MODE: `live` by default
- Database: not configured in local shell, so DB persistence jobs are implemented but not locally migrated/seeded in this run

## Provider Results

| Job/Provider | Env | Fetched | Saved | Failed | Notes |
|---|---|---:|---:|---:|---|
| Binance BTCUSDT ticker | none | 1 | 0 local DB | 0 | HTTP 200. Returned live price, 24h change, and volume. |
| Upbit KRW-BTC ticker | none | 1 | 0 local DB | 0 | HTTP 200. Returned live KRW price, 24h change, and volume. |
| Alternative Fear & Greed | none | 1 | 0 local DB | 0 | HTTP 200. Returned value `34` and classification `Fear` during local smoke run. |
| Data.go.kr KR EOD | `DATA_GO_KR_SERVICE_KEY` | 0 local | 0 | 0 | Job implemented; local persistence not executed because DB/env were not configured. |
| OpenDART | `OPENDART_API_KEY` | 0 local | 0 | 0 | Job implemented; requires corpCode and env for runtime verification. |
| Naver News | `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` | 0 local | 0 | 0 | Job implemented; title/link storage only. |
| SEC EDGAR | `SEC_USER_AGENT` | 0 local | 0 | 0 | Job implemented; CIK-missing assets are skipped. |

## API/UI Verification

| Page/API | Data Source | Status | Notes |
|---|---|---|---|
| `/api/cards/feed` | DB/provider/public crypto fallback | implemented | Live mode does not use mock fallback unless explicitly enabled. |
| `/api/provider-status` | env + DataProviderStatus + CronRun | implemented | Returns provider status rows and missing env. |
| `/data-status` | provider status | implemented | Displays status, last run, saved count, failed count, missing env, and errors. |
| `/api/admin/refresh-all` | direct job functions | implemented | No self-fetch. Requires `CRON_SECRET`. |

## Commands Run

- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm run prisma:validate`: passed.
- `npm run prisma:generate`: passed.
- `npm run data:smoke`: passed.
- `npm run check:banned-copy`: passed.
- `npm run data:verify-render`: passed against `http://localhost:3000`; `/api/cards/feed` returned 4 live cards and no mock card.
- `npm run test:ui`: passed.

## Remaining Problems

- Local DB was not configured, so DB insert counts for KR/US provider jobs were not verified locally.
- KRX short selling/investor flow is blocked until API IDs and response format are verified.
- Native Play Store/App Store wrapping remains out of scope for this release.
