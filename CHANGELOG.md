# Changelog

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
