# API Runtime Test Report

## Environment

- Date: 2026-05-14
- Branch: `feature/api-key-runtime-verification`
- DATA_MODE: `live`
- Local env: `.env` populated from user-provided API list. `.env` is gitignored and must not be committed.
- Database: not configured locally for this run, so DB persistence jobs were not migrated/seeded here.

## Provider Results

`npm run api:smoke` was added to test each configured provider without printing secret values. URL query secrets and token response fields are masked in output.

| Provider | Env | Runtime result | Notes |
|---|---|---|---|
| Data.go.kr stock | `DATA_GO_KR_SERVICE_KEY` | success | `005930` returned 2026-05-13 EOD row: close 284000, +1.79%, volume 35540134, amount 9797838529400. |
| Data.go.kr ETF | `DATA_GO_KR_PRODUCT_SERVICE_KEY` | success | `069500` returned ETF EOD row. |
| OpenDART | `OPENDART_API_KEY` | success | Samsung Electronics corp code `00126380` returned 5 filing rows with `bgn_de=20260101`. |
| Naver News | `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` | success | Query `삼성전자` returned 3 news title/link rows. |
| Alpaca | `ALPACA_API_KEY_ID`, `ALPACA_API_SECRET_KEY` | success | AAPL snapshot returned daily close. |
| FMP | `FMP_API_KEY` | success | AAPL quote returned price/change/volume. |
| Alpha Vantage | `ALPHA_VANTAGE_API_KEY` | success | AAPL Global Quote returned price/change/volume. |
| Twelve Data | `TWELVE_DATA_API_KEY` | success | AAPL quote returned close/change/volume. |
| Marketaux | `MARKETAUX_API_TOKEN` | success | AAPL news returned 3 articles. |
| Massive/Polygon REST | `POLYGON_API_KEY` | success | AAPL previous aggregate returned close/volume/OHLC. |
| FRED | `FRED_API_KEY` | success | `DGS10` returned latest 10-year Treasury observation. |
| BLS | `BLS_API_KEY` | success | `LNS14000000` returned unemployment series rows. |
| Coinalyze | `COINALYZE_API_KEY` | success | BTCUSDT perpetual open interest endpoint returned data. |
| KIS | `KIS_API_KEY`, `KIS_API_SECRET` | success | Token endpoint issued token. Note: official endpoint may rate-limit token issue to 1/min. |
| Kiwoom REST | `KIWOOM_REST_API_KEY`, `KIWOOM_REST_API_SECRET` | success | OAuth token endpoint issued token. |
| KRX Open API | `KRX_OPENAPI_AUTH_KEY`, `KRX_SHORT_SELLING_API_ID`, `KRX_INVESTOR_FLOW_API_ID` | blocked | Auth key exists, but short selling/investor flow API IDs are missing. |

## Rendering Verification

`npm run data:verify-render` passed against `http://localhost:3000`.

`/api/cards/feed` returned 7 live cards:

- Data.go.kr KR stock card: Samsung Electronics EOD price/change/volume/amount.
- Alpaca US card: Apple daily snapshot.
- Naver News card: Samsung Electronics news title/link basis.
- Binance crypto cards: BTC, ETH, SOL 24h data.
- Alternative Fear & Greed card.

No returned card had `isMock: true`.

`POST /api/admin/refresh-all` was called locally with `Authorization: Bearer CRON_SECRET`; it returned `ok: true`, app version `0.5.0-live-data`, and 10 job results.

## Commands Run

- `npm run api:smoke`: passed with 15 successes, 0 failed, 1 missing/blocked provider group (KRX API IDs).
- `npm run data:smoke`: passed.
- `npm run data:verify-render`: passed.
- `npm run check:banned-copy`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm run prisma:validate`: passed.
- `npm run prisma:generate`: passed.
- `npm run test:ui`: passed.

## Remaining Problems

- KRX Open API cannot be called until `KRX_SHORT_SELLING_API_ID` and `KRX_INVESTOR_FLOW_API_ID` are known.
- Local DB is not configured, so provider jobs could not persist rows locally in this run.
- KIS and Kiwoom are authentication-only checks for now. They are not used for order placement or app rendering.
