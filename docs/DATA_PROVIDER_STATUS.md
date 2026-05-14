# Data Provider Status

Last updated: 2026-05-14

Runtime status is exposed through `/api/provider-status` and `/data-status`. When a database is configured, provider jobs also persist status rows in `DataProviderStatus`.

| Provider | Data | Env Required | Status | Last Test | UI Section | Notes |
|---|---|---|---|---|---|---|
| Data.go.kr | KR EOD price, volume, amount, candles | `DATA_GO_KR_SERVICE_KEY` | implemented, env required | not runtime-tested locally because no DB/env | Home/Explore/Chart | No fake KR price if key or data is missing. |
| OpenDART | KR disclosure metadata | `OPENDART_API_KEY` | partial | not runtime-tested locally because no DB/env | Detail/Report | Corp code mapping is still required for broad coverage. |
| Naver News | news title/link/keyword | `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` | partial | not runtime-tested locally because no DB/env | Explore/Report | Store title/link only; do not repost article body. |
| SEC EDGAR | US 8-K/10-Q/10-K metadata | `SEC_USER_AGENT` | partial | not runtime-tested locally because no DB/env | US Detail/Report | CIK-missing assets are skipped and reported. |
| TradingView widgets | US price/rate/chart display | `NEXT_PUBLIC_ENABLE_TRADINGVIEW_WIDGETS=true` | implemented | build verified | Home/Detail | Widget display only; no widget data extraction. |
| Binance | crypto 24h ticker and candles | none | implemented and smoke-tested | 2026-05-14, HTTP 200 | Home/Explore/Chart | BTCUSDT live ticker returned price, 24h change, volume. |
| Upbit | KRW crypto ticker and candles | none | implemented and smoke-tested | 2026-05-14, HTTP 200 | Home/Explore/Chart | KRW-BTC live ticker returned price, 24h change, volume. |
| Alternative Fear & Greed | crypto sentiment | none | implemented and smoke-tested | 2026-05-14, HTTP 200 | Report/Maps/Home fallback | Returned Fear & Greed value/classification. |
| CoinGecko widget | crypto chart widget | `NEXT_PUBLIC_ENABLE_COINGECKO_WIDGETS=true` | implemented as widget policy | build verified | Crypto Detail | Widget display only. |
| Alpaca | US direct quote/candles | `US_DIRECT_PRICE_PROVIDER=alpaca`, `ALPACA_API_KEY_ID`, `ALPACA_API_SECRET_KEY` | partial | not runtime-tested locally | US cards/labels | Optional; not used when direct provider is `none`. |
| FMP | US direct quote | `US_DIRECT_PRICE_PROVIDER=fmp`, `FMP_API_KEY` | partial | not runtime-tested locally | US cards/labels | Optional direct price provider. |
| Alpha Vantage | US direct quote | `US_DIRECT_PRICE_PROVIDER=alphaVantage`, `ALPHA_VANTAGE_API_KEY` | partial | not runtime-tested locally | US cards/labels | Commercial use requires care. |
| Twelve Data | US quote/candles | `US_DIRECT_PRICE_PROVIDER=twelveData`, `TWELVE_DATA_API_KEY` | partial | not runtime-tested locally | US cards/labels | Optional direct price provider. |
| Marketaux | US/global news title/link | `MARKETAUX_API_TOKEN` | partial | not runtime-tested locally | Explore/Report | Title/link only. |
| KRX Open API | short selling/investor flow | `KRX_OPENAPI_AUTH_KEY`, `KRX_SHORT_SELLING_API_ID`, `KRX_INVESTOR_FLOW_API_ID` | blocked | not verified | Explore flows | API IDs and response format must be verified; no fake labels. |
| FRED | macro data | `FRED_API_KEY` | not implemented | not tested | Future | Candidate for macro labels. |
| BLS | labor/macro data | `BLS_API_KEY` | not implemented | not tested | Future | Candidate for macro labels. |
| Coinalyze | funding/OI | `COINALYZE_API_KEY` | not implemented | not tested | Future | Candidate for leverage labels. |
