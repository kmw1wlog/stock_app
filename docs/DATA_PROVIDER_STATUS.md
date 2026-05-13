# Data Provider Status

Last updated: 2026-05-14

| Provider | Data | Env Required | Status | Last Test | UI Section | Notes |
|---|---|---|---|---|---|---|
| Data.go.kr | KR EOD price/volume/amount | `DATA_GO_KR_SERVICE_KEY` | partial | build-time only | Home/Explore/Chart | Asset 전체 순회 cron 구현. 실제 키와 응답 포맷 운영 검증 필요 |
| OpenDART | disclosure metadata | `OPENDART_API_KEY` | partial | build-time only | Detail/Report | `dartCorpCode` 있는 종목만 조회 |
| Naver News | news title/link | `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` | partial | build-time only | Explore/Report | 제목/링크/키워드 중심 저장, 본문 재게시 없음 |
| SEC EDGAR | US filing metadata | `SEC_USER_AGENT` | partial | build-time only | US Detail/Report | CIK 있는 종목만 조회 |
| TradingView | US price/chart widget | `NEXT_PUBLIC_ENABLE_TRADINGVIEW_WIDGETS=true` | implemented | widget runtime | Home/Detail | 위젯 표시용. 데이터 추출 안 함 |
| Alpaca | US quote/candles | `US_DIRECT_PRICE_PROVIDER=alpaca`, `ALPACA_API_KEY_ID`, `ALPACA_API_SECRET_KEY` | partial | build-time only | US cards/labels | provider/cron 추가. market data endpoint는 `ALPACA_DATA_BASE_URL` 사용 |
| FMP | US quote | `US_DIRECT_PRICE_PROVIDER=fmp`, `FMP_API_KEY` | partial | build-time only | US cards/labels | quote provider 추가 |
| Alpha Vantage | US quote | `US_DIRECT_PRICE_PROVIDER=alphaVantage`, `ALPHA_VANTAGE_API_KEY` | partial | build-time only | US cards/labels | 약관상 상업 사용 주의, provider는 보조 |
| Twelve Data | US quote/candles | `US_DIRECT_PRICE_PROVIDER=twelveData`, `TWELVE_DATA_API_KEY` | partial | build-time only | US cards/labels | quote/candle provider 추가 |
| Marketaux | US/global news | `MARKETAUX_API_TOKEN` | partial | build-time only | Explore/Report | 제목/링크 중심 저장 |
| Binance | crypto 24h/candles | none | partial | build-time only | Home/Explore/Chart | public API provider 구현 |
| Upbit | KRW crypto 24h/candles | none | partial | build-time only | Home/Explore/Chart | public API provider 구현 |
| Alternative Fear & Greed | crypto sentiment | none | partial | build-time only | Report/Maps | payload/label 저장 구조 구현 |
| KRX Open API | short selling/investor flow | `KRX_OPENAPI_AUTH_KEY`, `KRX_SHORT_SELLING_API_ID`, `KRX_INVESTOR_FLOW_API_ID` | partial/blocked | not verified | Explore flows | API ID와 권한이 확정되어야 실사용 가능 |
| FRED | macro data | `FRED_API_KEY` | not implemented | not tested | Future | 매크로 라벨용 후보 |
| BLS | labor/macro data | `BLS_API_KEY` | not implemented | not tested | Future | 고용/물가 라벨용 후보 |
| Coinalyze | funding/OI | `COINALYZE_API_KEY` | not implemented | not tested | Future | 코인 레버리지 라벨용 후보 |
