# Data Provider Status

Last updated: 2026-05-14

Runtime status is exposed through `/api/provider-status` and `/data-status`. When a database is configured, provider jobs also persist status rows in `DataProviderStatus`.

| Provider | Data | Env Required | Status | Last Test | UI Section | Notes |
|---|---|---|---|---|---|---|
| Data.go.kr | KR EOD price, volume, amount, candles | `DATA_GO_KR_SERVICE_KEY` | implemented and smoke-tested | 2026-05-14, HTTP 200 | Home/Explore/Chart | `005930` returned EOD price/change/volume/amount and is rendered in feed fallback. |
| Data.go.kr Product | ETF/ETN/ELW EOD price data | `DATA_GO_KR_PRODUCT_SERVICE_KEY` | implemented and smoke-tested | 2026-05-14, HTTP 200 | Future ETF cards | `069500` returned ETF EOD row. |
| OpenDART | KR disclosure metadata | `OPENDART_API_KEY` | partial, smoke-tested | 2026-05-14, HTTP 200 | Detail/Report | Samsung corp code returned filings; broad coverage still requires corp code mapping. |
| Naver News | news title/link/keyword | `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` | implemented and smoke-tested | 2026-05-14, HTTP 200 | Explore/Report/Home fallback | Store title/link only; do not repost article body. |
| SEC EDGAR | US 8-K/10-Q/10-K metadata | `SEC_USER_AGENT` | partial | not retested in this pass | US Detail/Report | CIK-missing assets are skipped and reported. |
| TradingView widgets | US price/rate/chart display | `NEXT_PUBLIC_ENABLE_TRADINGVIEW_WIDGETS=true` | implemented | build verified | Home/Detail | Widget display only; no widget data extraction. |
| Binance | crypto 24h ticker and candles | none | implemented and smoke-tested | 2026-05-14, HTTP 200 | Home/Explore/Chart | BTCUSDT live ticker returned price, 24h change, volume. |
| Upbit | KRW crypto ticker and candles | none | implemented and smoke-tested | 2026-05-14, HTTP 200 | Home/Explore/Chart | KRW-BTC live ticker returned price, 24h change, volume. |
| Alternative Fear & Greed | crypto sentiment | none | implemented and smoke-tested | 2026-05-14, HTTP 200 | Report/Maps/Home fallback | Returned Fear & Greed value/classification. |
| CoinGecko widget | crypto chart widget | `NEXT_PUBLIC_ENABLE_COINGECKO_WIDGETS=true` | implemented as widget policy | build verified | Crypto Detail | Widget display only. |
| Alpaca | US direct quote/candles | `US_DIRECT_PRICE_PROVIDER=alpaca`, `ALPACA_API_KEY_ID`, `ALPACA_API_SECRET_KEY` | implemented and smoke-tested | 2026-05-14, HTTP 200 | US cards/labels/Home fallback | AAPL snapshot is rendered in feed fallback when provider is alpaca. |
| FMP | US direct quote | `US_DIRECT_PRICE_PROVIDER=fmp`, `FMP_API_KEY` | smoke-tested, provider available | 2026-05-14, HTTP 200 | US cards/labels | Optional direct price provider. |
| Alpha Vantage | US direct quote | `US_DIRECT_PRICE_PROVIDER=alphaVantage`, `ALPHA_VANTAGE_API_KEY` | smoke-tested, provider available | 2026-05-14, HTTP 200 | US cards/labels | Commercial use requires care. |
| Twelve Data | US quote/candles | `US_DIRECT_PRICE_PROVIDER=twelveData`, `TWELVE_DATA_API_KEY` | smoke-tested, provider available | 2026-05-14, HTTP 200 | US cards/labels | Optional direct price provider. |
| Marketaux | US/global news title/link | `MARKETAUX_API_TOKEN` | smoke-tested | 2026-05-14, HTTP 200 | Explore/Report | Title/link only. |
| Massive/Polygon | US aggregate quote | `POLYGON_API_KEY` | smoke-tested, not app-wired | 2026-05-14, HTTP 200 | Future | AAPL previous aggregate returned. |
| KRX Open API | short selling/investor flow | `KRX_OPENAPI_AUTH_KEY`, `KRX_SHORT_SELLING_API_ID`, `KRX_INVESTOR_FLOW_API_ID` | blocked until API IDs supplied | 2026-05-14 | Explore flows | Auth key exists; API IDs are missing. No fake short/flow labels. |
| Kiwoom REST | KR short selling/lending/investor flow | `KIWOOM_REST_API_KEY`, `KIWOOM_REST_API_SECRET` | implemented and smoke-tested | 2026-05-14, HTTP 200 | Home/Explore flows | `ka10014`, `ka20068`, and `ka10059` returned Samsung Electronics rows. Refresh cadence: market hours 15m, after close hourly, holidays daily. |
| FRED | macro data | `FRED_API_KEY` | smoke-tested, not app-wired | 2026-05-14, HTTP 200 | Future | DGS10 returned. |
| BLS | labor/macro data | `BLS_API_KEY` | smoke-tested, not app-wired | 2026-05-14, HTTP 200 | Future | Unemployment series returned. |
| Coinalyze | funding/OI | `COINALYZE_API_KEY` | smoke-tested, not app-wired | 2026-05-14, HTTP 200 | Future | BTCUSDT open interest returned. |
| KIS Open API | auth token | `KIS_API_KEY`, `KIS_API_SECRET` | smoke-tested auth only | 2026-05-14, HTTP 200 | Future | Token issued; repeated issue can hit official 1/min throttle. |
| Kiwoom REST auth | auth token | `KIWOOM_REST_API_KEY`, `KIWOOM_REST_API_SECRET` | smoke-tested auth | 2026-05-14, HTTP 200 | Provider auth | Token issued; no trading/order use. |
