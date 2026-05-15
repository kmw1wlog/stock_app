# Data Source Strategy

Last updated: 2026-05-14

The app separates data that can be fetched and stored from data that must remain inside official widgets.

## Stored API Data

| Market | Provider | Data | Storage | UI |
|---|---|---|---|---|
| KR | Data.go.kr Financial Services Commission stock price API | EOD OHLCV, change rate, volume, amount | `AssetPriceDaily`, `AssetLabel`, `ProviderPayloadCache` | Cards, EOD chart |
| KR | OpenDART | disclosure metadata | `NewsMention`/future disclosure table, `AssetLabel`, `ProviderPayloadCache` | Disclosure labels, detail/report |
| KR | Naver Search API | news title/link/keyword | `NewsMention`, `AssetLabel` | News/disclosure sections |
| US | SEC EDGAR | 10-K, 10-Q, 8-K filings | `NewsMention`/future disclosure table, `AssetLabel` | US event labels |
| US | Alpaca/FMP/Alpha Vantage/Twelve Data | direct quote/candles when configured | `AssetPriceDaily`, `AssetLabel` | Optional US numeric cards |
| US | Marketaux | news title/link | `NewsMention`, `AssetLabel` | US/global news |
| Crypto | Binance/Upbit | 24h ticker, candles | `AssetPriceIntraday`, `AssetPriceDaily`, `AssetLabel` | Crypto cards/charts |
| Crypto | Alternative Fear & Greed | market sentiment | `ProviderPayloadCache`, `AssetLabel` | Sentiment cards/report |

## Official Widget Data

Some market data is safer to display through official widgets because redistribution rights are unclear or exchange licensing is required.

| Provider | Data | UI Policy |
|---|---|---|
| TradingView widgets | US price, rate, chart; optional crypto chart | Display widget as-is and keep attribution/logo. Do not extract widget data. |
| CoinGecko widgets | crypto price/chart | Display widget as-is. |
| CoinMarketCap widgets | crypto ticker | Display widget as-is when enabled. |

## Prohibited

- Yahoo/Naver/TradingView screen scraping.
- Extracting price data from widget DOM.
- Fake price, fake rate, or fake chart in `DATA_MODE=live`.
- Committing API keys to the repository.
- Reposting full news article bodies.
