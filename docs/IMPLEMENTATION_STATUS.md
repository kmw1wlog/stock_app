# Implementation Status

Last updated: 2026-05-14

| Area | Status | Notes |
|---|---|---|
| Versioning | Implemented | `package.json` is `0.5.0`; `src/lib/version.ts` is `0.5.0-live-data`. |
| Branch workflow | Implemented | Current predeploy detail/diagnosis/MTS work is on `feature/predeploy-detail-diagnosis-mts`; main is not edited directly before PR merge. |
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
| Condition alert MVP | Implemented | Added `UserConditionAlert`, `ConditionAlertTrigger`, `/api/condition-alerts`, alert setup modal, and `/alerts` management page. |
| Detail diagnosis panel | Implemented | Added `StockDiagnosisPanel` with score, supply stars, institution/foreigner accumulation, volume, short selling, volatility, finance, valuation, sector momentum, and after-hours labels. |
| Kiwoom investor flow persistence | Implemented route, requires env | Added `InvestorFlowDaily` model and `/api/cron/kiwoom-investor-flow`. Refresh cadence: EOD 16:10~17:30 KST once. |
| After-hours quote persistence | Partial | Added `AfterHoursQuoteDaily`, `afterHours` provider, and `/api/cron/after-hours`. Kiwoom `ka10087` is the selected lawful source candidate; production response format still needs account/env validation. Refresh cadence: EOD 18:20~19:00 KST once. |
| Daily candle fallback | Implemented | `getDailyCandles` now reads DB first, then fetches KR Data.go.kr or crypto Binance/Upbit candles, saves them, and returns them without generating fake candles. |
| External research links | Implemented | Detail page links to OpenDART, YouTube, X, and Naver News and logs `external_research_click`. |
| MTS selector MVP | Implemented | Added MTS provider catalog, `MTS에서 종목 보기` CTA, `/mts/select`, provider click logging, and sponsored disclosure. |
| Sponsored slots | Implemented | Native ad cards now disclose `광고 / Sponsored` and state they are unrelated to condition selection or alert results. |
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
