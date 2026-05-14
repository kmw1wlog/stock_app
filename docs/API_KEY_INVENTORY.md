# API Key Inventory

Last updated: 2026-05-14

Secrets are stored only in local `.env` or deployment env. This document records env names, intended usage, and current integration status without exposing the keys.

| Provider | Env | Purpose in app | Official/runtime endpoint used | Status |
|---|---|---|---|---|
| OpenDART | `OPENDART_API_KEY` | KR disclosure metadata and labels | `https://opendart.fss.or.kr/api/list.json` | smoke-tested by `api:smoke` |
| Data.go.kr Stock Securities | `DATA_GO_KR_SERVICE_KEY` | KR stock EOD price, change rate, volume, amount, candles | `https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo` | smoke-tested by `api:smoke` |
| Data.go.kr Securities Product | `DATA_GO_KR_PRODUCT_SERVICE_KEY` | ETF/ETN/ELW EOD product price data | `https://apis.data.go.kr/1160100/service/GetSecuritiesProductInfoService/getETFPriceInfo` | smoke-tested by `api:smoke` |
| Alpaca Market Data | `ALPACA_API_KEY_ID`, `ALPACA_API_SECRET_KEY`, `ALPACA_DATA_BASE_URL` | Optional US direct quote and daily candles | `https://data.alpaca.markets/v2/stocks/{symbol}/snapshot` | smoke-tested by `api:smoke`; app provider exists |
| Alpaca Trading/Paper | `ALPACA_PAPER_BASE_URL` | Account/trading endpoint reference only | `https://paper-api.alpaca.markets/v2` | not used for market display |
| Alpha Vantage | `ALPHA_VANTAGE_API_KEY` | Optional US direct quote fallback | `https://www.alphavantage.co/query?function=GLOBAL_QUOTE` | smoke-tested by `api:smoke`; app provider exists |
| FMP | `FMP_API_KEY` | Optional US direct quote fallback | `https://financialmodelingprep.com/stable/quote` | smoke-tested by `api:smoke`; app provider exists |
| Massive/Polygon REST | `POLYGON_API_KEY` | Optional US historical/aggregate price fallback | `https://api.polygon.io/v2/aggs/ticker/{symbol}/prev` | smoke-tested by `api:smoke`; app provider not yet wired |
| Massive Flat Files | `MASSIVE_S3_ACCESS_KEY_ID`, `MASSIVE_S3_SECRET_ACCESS_KEY`, `MASSIVE_S3_ENDPOINT`, `MASSIVE_S3_BUCKET` | Bulk historical market data candidate | `https://files.massive.com` S3-compatible flat files | documented; not app-wired |
| Marketaux | `MARKETAUX_API_TOKEN` | US/global news title/link only | `https://api.marketaux.com/v1/news/all` | smoke-tested by `api:smoke`; app provider exists |
| Twelve Data | `TWELVE_DATA_API_KEY` | Optional US direct quote/candles fallback | `https://api.twelvedata.com/quote` | smoke-tested by `api:smoke`; app provider exists |
| KRX Open API | `KRX_OPENAPI_AUTH_KEY`, `KRX_SHORT_SELLING_API_ID`, `KRX_INVESTOR_FLOW_API_ID` | KR short selling and investor flow labels | KRX Open API service endpoint depends on API ID | blocked until API IDs are supplied |
| Coinalyze | `COINALYZE_API_KEY` | Crypto funding/OI/leverage labels | `https://api.coinalyze.net/v1/open-interest` | smoke-tested by `api:smoke`; app provider not yet wired |
| Naver Search API | `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` | KR news title/link search | `https://openapi.naver.com/v1/search/news.json` | smoke-tested by `api:smoke`; app provider exists |
| Kiwoom REST | `KIWOOM_REST_API_KEY`, `KIWOOM_REST_API_SECRET`, `KIWOOM_ACCOUNT_NO`, `KIWOOM_ALLOWED_IP` | Future KR direct quote/trading API candidate | `https://api.kiwoom.com/oauth2/token` | token smoke-tested by `api:smoke`; app provider not wired |
| KIS Open API | `KIS_API_KEY`, `KIS_API_SECRET` | Future KR/US quote provider candidate | `https://openapi.koreainvestment.com:9443/oauth2/tokenP` | token smoke-tested by `api:smoke`; app provider not wired |
| FRED | `FRED_API_KEY` | US macro labels | `https://api.stlouisfed.org/fred/series/observations` | smoke-tested by `api:smoke`; app provider not wired |
| BLS | `BLS_API_KEY` | US labor/macro labels | `https://api.bls.gov/publicAPI/v2/timeseries/data/` | smoke-tested by `api:smoke`; app provider not wired |

## Official Documentation Notes

- Data.go.kr stock/security product services use `serviceKey`, `resultType=json`, and service-specific operations such as `getStockPriceInfo` and `getETFPriceInfo`.
- OpenDART disclosure list uses `crtfc_key`, `corp_code`, and pagination parameters.
- Naver Search API uses `X-Naver-Client-Id` and `X-Naver-Client-Secret` headers.
- SEC EDGAR remains part of the app provider set and requires a compliant `SEC_USER_AGENT`.
- Alpaca market data uses `APCA-API-KEY-ID` and `APCA-API-SECRET-KEY` headers against `data.alpaca.markets`.
- Kiwoom and KIS token checks are authentication-only. They are not used for order placement.
