# Implementation Status

Last updated: 2026-05-14

| Area | Status | Notes |
|---|---|---|
| Versioning | Implemented | `package.json` is `0.5.0`; `src/lib/version.ts` is `0.5.0-live-data`. |
| Branch workflow | Implemented | Work is on `feature/v0.5.0-live-data`; main is not edited directly. |
| DATA_MODE policy | Implemented | `DATA_MODE=live` blocks mock card fallback unless `DATA_MODE=mock` or `NEXT_PUBLIC_ALLOW_MOCK_DATA=true`. |
| Provider fetch outcome | Implemented | `safeProviderFetch` keeps status, raw text snippet, parse errors, and missing env. |
| Provider status persistence | Implemented | `DataProviderStatus` model and status helpers are present. |
| Provider status API/UI | Implemented | `/api/provider-status` and `/data-status` expose env, status, counts, last run, and errors. |
| Admin refresh | Implemented | `/api/admin/refresh-all` calls job functions directly. |
| Public crypto runtime data | Implemented and smoke-tested | Binance, Upbit, and Alternative Fear & Greed returned live data on 2026-05-14. |
| Home feed live fallback | Implemented | `/api/cards/feed` can render real public crypto cards without DB; mock remains disabled in live. |
| KR EOD pipeline | Partial | Asset-wide job exists, but actual Data.go.kr persistence requires `DATA_GO_KR_SERVICE_KEY` and a database. |
| OpenDART pipeline | Partial | Job exists; complete coverage requires corp code mapping and `OPENDART_API_KEY`. |
| Naver News pipeline | Partial | Job exists; requires Naver API env. Title/link only, no article body repost. |
| SEC EDGAR pipeline | Partial | Job exists and skips CIK-missing assets. Requires proper `SEC_USER_AGENT`. |
| US direct price | Partial | Optional provider job exists. If `US_DIRECT_PRICE_PROVIDER=none`, US price/rate is shown only through TradingView widgets. |
| KRX short/flow | Blocked | Env and provider status surface exist. API ID/permission and response format must be verified before labels are enabled. |
| Chart policy | Implemented policy | Native chart requires real candles. US uses TradingView widgets when direct price provider is not configured. |
| Premium/user behavior UI | Removed from UI | Banned UI copy script passes. |
| PWA | Partial | Manifest exists; native store wrapping is not included in this version. |

## Latest Local Verification

- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm run prisma:validate`: passed.
- `npm run prisma:generate`: passed.
- `npm run data:smoke`: passed with Binance, Upbit, and Alternative Fear & Greed.
- `npm run check:banned-copy`: passed.
- `npm run data:verify-render`: passed against `http://localhost:3000`; `/api/cards/feed` returned 4 live cards with `isMock: false`.
- `npm run test:ui`: passed.
