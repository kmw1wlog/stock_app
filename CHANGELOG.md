# Changelog

## Unreleased - Flip Card Condition Alert Home

- Replaced the home stock horizontal carousel with an explicit front/back flip card flow.
- Added a 3-second front card focused on evidence, primary formula recommendation, and the main `이 조건 알림 받기` CTA.
- Added a back card summarizing why the card appeared, formula criteria, caution rules, diagnosis summary, related stocks, formula detail, and MTS viewing.
- Added formula candidate scoring and a bottom sheet for `다른 조건식 추천받기`.
- Added alert preview UI showing the exact notification-style evidence line before creating an alert.
- Repaired Korean copy in formula, alert, MTS, chart, relation, and home feed surfaces touched by this flow.

## Unreleased - X/Tinder Home Feed + Search Explore

- Reworked the home screen into a vertical stock feed with horizontal panels for main info, daily chart/technical conditions, financial checks, and related stocks.
- Added market session clock with auto/manual KR/CRYPTO/US selection and `급상승 / 거래대금` sort tabs.
- Moved home list-style discovery into Explore and added a new 거래대금 explore section plus `/explore/amount` and `/api/explore/amount`.
- Added `/search` with stock name/symbol/theme/label filtering using DB assets or live display cards.
- Added relation utilities for same-theme and same-chart-type grids.
- Added analytics event names for market session, home sort, panel, related stock, technical condition, and search experiments.

## Unreleased - Predeploy Detail/MTS Diagnosis Finish

- Rebuilt the card detail page order around hero, chart, stock diagnosis, MTS CTA, chart setup, why appeared, external research, formula/alert, and bottom sponsored slot.
- Added rule-based `StockDiagnosisPanel` with score, supply stars, institution/foreigner accumulation label, volume, short-selling, ATR volatility, finance, valuation, sector momentum, and after-hours reaction labels.
- Added `InvestorFlowDaily` and `AfterHoursQuoteDaily` Prisma models plus Kiwoom EOD cron routes for investor flow and after-hours collection.
- Added Data.go.kr candle provider fallback in `getDailyCandles`; KR and crypto detail charts now try real provider candles when DB candles are missing.
- Added external research links for OpenDART, YouTube, X, and Naver News with `external_research_click` logging.
- Added detail MTS CTA panel with sponsored disclosure and MTS selection routing.
- Repaired corrupted Korean UI copy in home, detail, formula, alert, ads, and MTS surfaces.

## 0.5.0 - Live Data Display MVP

- Added condition alert MVP with anonymous-user alert persistence, `/alerts`, and `/api/condition-alerts`.
- Reworked home/detail/formula CTAs around condition alerts, formula explanation, and MTS viewing.
- Added MTS selector flow with sponsored disclosure and provider click logging.
- Added explicit Sponsored ad disclosures across home, explore, rankings, formula, saved, and MTS surfaces.
- Hardened banned-copy checks for trading-inducing phrases and switched UI tests to production `next start`.
- Added `api:smoke` for user-provided API key verification across KR, US, crypto, macro, and broker-auth providers.
- Added `docs/API_KEY_INVENTORY.md` and updated runtime provider documentation with actual smoke results.
- Connected configured Data.go.kr, Alpaca, and Naver API data to live feed fallback rendering.
- Added Kiwoom REST as the KRX-direct fallback for Samsung Electronics short selling, stock lending, and investor flow data.
- Added `/api/korea/short-flow` summary output and wired Kiwoom short/flow data into the explore flows section.
- Work branch: `feature/v0.5.0-live-data`.
- Set `package.json` version to `0.5.0` and app version to `0.5.0-live-data`.
- Added structured provider fetch outcomes and persistent `DataProviderStatus`.
- Reworked `/api/admin/refresh-all` to call provider jobs directly instead of self-calling API routes.
- Added `/api/provider-status` and `/data-status` for runtime provider visibility.
- Added public crypto fallback rendering from Binance, Upbit, and Alternative Fear & Greed when the DB is unavailable or empty.
- Enforced `DATA_MODE=live` behavior so mock cards are not returned unless mock mode is explicitly enabled.
- Added smoke and render verification scripts for live provider data.

## 0.4.0 - Data Display MVP

- Added initial data mode policy and live/mock separation.
- Converted core home/explore/rankings/report surfaces toward official API, DB, and widget based rendering.
- Removed premium and user-behavior based UI from production-facing screens.
- Added initial provider routes for Data.go.kr, OpenDART, Naver News, SEC EDGAR, Binance, Upbit, and Alternative Fear & Greed.
- Added PWA manifest and deployment documentation baseline.
