# Data Provider Status

Last updated: 2026-05-14

Runtime status is written by provider jobs when a database is available. This document records the intended provider behavior for v0.5.0-live-data.

| Provider | Data | Env Required | Status | Last Test | UI Section | Notes |
|---|---|---|---|---|---|---|
| Data.go.kr | KR EOD price/volume/amount | `DATA_GO_KR_SERVICE_KEY` | implemented, env required | pending runtime | Home/Explore/Chart | No fake KR price if key is missing |
| OpenDART | disclosure metadata | `OPENDART_API_KEY` | implemented, env required | pending runtime | Detail/Report | Corp code mapping is required for complete coverage |
| Naver News | news title/link | `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` | implemented, env required | pending runtime | Explore/Report | Title/link only, no article body repost |
| SEC EDGAR | US filing metadata | `SEC_USER_AGENT` | implemented | pending runtime | US Detail/Report | Fair access user-agent required |
| TradingView | US price/chart widget | `NEXT_PUBLIC_ENABLE_TRADINGVIEW_WIDGETS=true` | implemented | widget runtime | Home/Detail | Widget display only, no extraction |
| Alpaca | US quote/candles | `US_DIRECT_PRICE_PROVIDER=alpaca`, `ALPACA_API_KEY_ID`, `ALPACA_API_SECRET_KEY` | partial | pending runtime | US cards/labels | Direct price optional |
| FMP | US quote | `US_DIRECT_PRICE_PROVIDER=fmp`, `FMP_API_KEY` | partial | pending runtime | US cards/labels | Direct price optional |
| Alpha Vantage | US quote | `US_DIRECT_PRICE_PROVIDER=alphaVantage`, `ALPHA_VANTAGE_API_KEY` | partial | pending runtime | US cards/labels | Commercial use requires care |
| Twelve Data | US quote/candles | `US_DIRECT_PRICE_PROVIDER=twelveData`, `TWELVE_DATA_API_KEY` | partial | pending runtime | US cards/labels | Direct price optional |
| Marketaux | US/global news | `MARKETAUX_API_TOKEN` | partial | pending runtime | Explore/Report | Title/link only |
| Binance | crypto 24h/candles | none | implemented | pending runtime | Home/Explore/Chart | Keyless public provider |
| Upbit | KRW crypto 24h/candles | none | implemented | pending runtime | Home/Explore/Chart | Keyless public provider |
| Alternative Fear & Greed | crypto sentiment | none | implemented | pending runtime | Report/Maps | Keyless public provider |
| CoinGecko widget | crypto price/chart display | `NEXT_PUBLIC_ENABLE_COINGECKO_WIDGETS=true` | implemented | widget runtime | Crypto Detail | Widget display only |
| KRX Open API | short selling/investor flow | `KRX_OPENAPI_AUTH_KEY`, `KRX_SHORT_SELLING_API_ID`, `KRX_INVESTOR_FLOW_API_ID` | blocked until API IDs verified | not verified | Explore flows | No fake short/flow labels |
| FRED | macro data | `FRED_API_KEY` | not implemented | not tested | Future | Macro label candidate |
| BLS | labor/macro data | `BLS_API_KEY` | not implemented | not tested | Future | Macro label candidate |
| Coinalyze | funding/OI | `COINALYZE_API_KEY` | not implemented | not tested | Future | Crypto leverage label candidate |
