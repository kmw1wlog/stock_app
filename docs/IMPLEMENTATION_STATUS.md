# Implementation Status

Last updated: 2026-05-14

| Area | Status | Notes |
|---|---|---|
| Versioning | Implemented | `package.json` is `0.5.0`; `src/lib/version.ts` is `0.5.0-live-data`. |
| Branch workflow | Implemented | Current KRX-alternative work is on `feature/krx-alternative-short-flow`; main is not edited directly. |
| DATA_MODE policy | Implemented | `DATA_MODE=live` blocks mock card fallback unless `DATA_MODE=mock` or `NEXT_PUBLIC_ALLOW_MOCK_DATA=true`. |
| Provider fetch outcome | Implemented | `safeProviderFetch` keeps status, raw text snippet, parse errors, and missing env. |
| Provider status persistence | Implemented | `DataProviderStatus` model and status helpers are present. |
| Provider status API/UI | Implemented | `/api/provider-status` and `/data-status` expose env, status, counts, last run, and errors. |
| Admin refresh | Implemented | `/api/admin/refresh-all` calls job functions directly. |
| Public crypto runtime data | Implemented and smoke-tested | Binance, Upbit, and Alternative Fear & Greed returned live data on 2026-05-14. |
| Home feed live fallback | Implemented | `/api/cards/feed` renders real Data.go.kr, Alpaca, Naver, Binance, and Alternative Fear & Greed cards without DB; mock remains disabled in live. |
| KR EOD pipeline | Partial | Data.go.kr key was smoke-tested successfully. DB persistence still requires database env. |
| OpenDART pipeline | Partial | OpenDART key was smoke-tested successfully with Samsung Electronics corp code. Broader coverage requires corp code mapping. |
| Naver News pipeline | Partial | Naver Search API was smoke-tested successfully. Title/link only, no article body repost. |
| SEC EDGAR pipeline | Partial | Job exists and skips CIK-missing assets. Requires proper `SEC_USER_AGENT`. |
| US direct price | Partial | Optional provider job exists. If `US_DIRECT_PRICE_PROVIDER=none`, US price/rate is shown only through TradingView widgets. |
| KRX short/flow | Blocked | Env and provider status surface exist. API ID/permission and response format must be verified before labels are enabled. |
| KRX alternative source | Implemented via Kiwoom REST | Kiwoom `ka10014`, `ka20068`, and `ka10059` are smoke-tested and rendered through `/api/korea/short-flow` plus a home feed card. |
| Full API inventory | Implemented | `docs/API_KEY_INVENTORY.md` maps every user-provided key to env, endpoint, app use, and status. |
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
- `npm run data:verify-render`: passed against `http://localhost:3000`; `/api/cards/feed` returned 8 live cards with `isMock: false`.
- `npm run test:ui`: passed.
- `npm run api:smoke`: passed with 16 successful providers and 1 blocked KRX API-ID group.
- `POST /api/admin/refresh-all`: passed locally with 10 job results using `CRON_SECRET`.
- `GET /api/korea/short-flow?symbol=005930`: passed locally with Kiwoom short selling, lending, and investor rows.
- `GET /api/explore/flows`: passed locally and returned the Kiwoom short/flow card.
