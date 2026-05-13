# Data Source Strategy

Last updated: 2026-05-14

이 앱은 데이터 수집 방식을 두 갈래로 분리한다.

## 1. API로 받아와 DB에 저장하는 데이터

API 키가 있거나 공개 API로 허용되는 데이터는 서버 cron에서 받아와 DB에 저장한다.

| Market | Provider | Data | Storage | UI |
|---|---|---|---|---|
| KR | Data.go.kr 금융위원회 주식시세정보 | EOD OHLCV, 등락률, 거래량, 거래대금 | `AssetPriceDaily` | 카드 숫자, EOD 차트 |
| KR | OpenDART | 공시 metadata | `NewsMention`, `AssetLabel`, `ProviderPayloadCache` | 공시 라벨, 상세/리포트 |
| KR | Naver Search API | 뉴스 제목/링크/키워드 | `NewsMention`, `AssetLabel` | 뉴스/공시 섹션 |
| US | SEC EDGAR | 10-K, 10-Q, 8-K 등 filings | `NewsMention`, `AssetLabel` | 미장 이벤트 |
| US | Alpaca/FMP/Alpha Vantage/Twelve Data | 직접 가격/등락률/캔들 | `AssetPriceDaily`, `AssetLabel` | `US_DIRECT_PRICE_PROVIDER` 설정 시 |
| US | Marketaux | 뉴스 제목/링크 | `NewsMention`, `AssetLabel` | 미장 뉴스 |
| Crypto | Binance/Upbit | 24h ticker, candles | `AssetPriceIntraday`, `AssetPriceDaily`, `AssetLabel` | 코인 카드/차트 |
| Crypto | Alternative Fear & Greed | 시장 심리 | `ProviderPayloadCache`, `AssetLabel` | 공포탐욕 |

## 2. 공식 사이트/위젯으로 조회해서 표시하는 데이터

재배포 권리 이슈가 있거나 직접 API 권리가 불명확한 데이터는 위젯으로 표시한다. 위젯에서 데이터를 추출하지 않는다.

| Provider | Data | UI Policy |
|---|---|---|
| TradingView widgets | 미장 가격/등락률/차트, 일부 코인 차트 | 위젯 그대로 표시, 로고/출처 유지 |
| CoinGecko widgets | 코인 가격/차트 | 위젯 그대로 표시 |
| CoinMarketCap widgets | 코인 티커 | 필요 시 위젯 그대로 표시 |

## 금지 원칙

- Yahoo/Naver/TradingView 화면 크롤링 금지
- 위젯 DOM에서 가격 추출 금지
- live 모드에서 임의 가격, 임의 등락률, 임의 차트 표시 금지
- API 키를 repo에 커밋 금지
- 뉴스 원문 본문 재게시 금지

