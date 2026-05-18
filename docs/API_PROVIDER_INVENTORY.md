# API Provider Inventory

`stock_app` phase 1 is Korean-equity-first. The app renders only KR cards in Home/Explore, while `phone_stock_app` simply opens the Production URL and does not hold any provider secret.

| Provider | 용도 | 필요한 env | 현재 코드 위치 | 저장 대상 | 호출 주기 | Vercel/Worker | 상태 |
|---|---|---|---|---|---|---|---|
| OpenDART | 공시 메타데이터, 뒷면 공시 섹션 | `OPENDART_API_KEY` | `src/lib/providers/korea/openDart.ts` | DB `NewsMention` / runtime response | 5~30분 | Vercel job + detail API | 구현/테스트 |
| Data.go.kr 주식시세 | 국장 EOD 가격/거래량/거래대금 | `DATA_GO_KR_SERVICE_KEY` | `src/lib/providers/korea/dataGoKr.ts` | DB `AssetPriceDaily` / card build | 5~30분 또는 EOD | Vercel job | 구현/테스트 |
| Data.go.kr ETF/ETN/ELW | ETF/상품 시세 smoke 및 추후 확장 | `DATA_GO_KR_PRODUCT_SERVICE_KEY` | `scripts/api-provider-smoke.ts` | phase1 미적재 | 필요 시 | Vercel job | smoke only |
| Naver News | 종목/테마 뉴스 제목/링크 | `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` | `src/lib/providers/korea/naverNews.ts` | DB `NewsMention` / detail API | 5~15분 | Vercel job + detail API | 구현/테스트 |
| KRX Open API | 공매도/투자자 수급 | `KRX_OPENAPI_AUTH_KEY`, `KRX_SHORT_SELLING_API_ID`, `KRX_INVESTOR_FLOW_API_ID` | `src/lib/providers/korea/krxOpenApi.ts` | DB or runtime | 일/장중 | job | 부분 구현, API ID 필요 |
| Kiwoom REST | 국장 단기 수급/공매도/대차 | `KIWOOM_REST_API_KEY`, `KIWOOM_REST_API_SECRET`, `KIWOOM_API_BASE_URL` | `src/lib/providers/korea/kiwoomKrData.ts`, `scripts/api-provider-smoke.ts` | DB/rich detail | 5~30분 | Vercel job or worker | smoke 대상 |
| KIS | 장중 1분봉, formula runtime, live alerts | `KIS_APP_KEY`, `KIS_APP_SECRET`, `KIS_BASE_URL` 등 | `backend/realtime/`, `linux_1m_api_handoff_20260515/` | `runtime_output` / DB | 60초 | 별도 worker | 핵심, worker 필요 |
| Alpaca | 미장 quote/candle | `ALPACA_API_KEY_ID`, `ALPACA_API_SECRET_KEY` | `src/lib/providers/us/usDirectProvider.ts`, `scripts/api-provider-smoke.ts` | US cards only | on-demand/job | Vercel | phase1 비노출 |
| Alpha Vantage | 미장 quote 보조 | `ALPHA_VANTAGE_API_KEY` | `src/lib/providers/us/usDirectProvider.ts`, `scripts/api-provider-smoke.ts` | US cards only | on-demand/job | Vercel | phase1 비노출 |
| FMP | 미장 quote 보조 | `FMP_API_KEY` | `src/lib/providers/us/usDirectProvider.ts`, `scripts/api-provider-smoke.ts` | US cards only | on-demand/job | Vercel | phase1 비노출 |
| Twelve Data | 미장 quote/candle 보조 | `TWELVE_DATA_API_KEY` | `src/lib/providers/us/usDirectProvider.ts`, `scripts/api-provider-smoke.ts` | US cards only | on-demand/job | Vercel | phase1 비노출 |
| Marketaux | 글로벌 뉴스 | `MARKETAUX_API_TOKEN` | `src/lib/jobs/marketauxNewsJob.ts`, `scripts/api-provider-smoke.ts` | DB/news | 15~60분 | Vercel job | phase1 비노출 |
| Massive/Polygon | 미장 시세/flat files | `POLYGON_API_KEY` 또는 Massive key | `scripts/api-provider-smoke.ts` | US expansion | on-demand | Vercel | smoke only |
| Coinalyze | 코인 파생/오픈이자 | `COINALYZE_API_KEY` | `scripts/api-provider-smoke.ts` | crypto only | on-demand | Vercel | phase1 비노출 |
| FRED | 거시지표 | `FRED_API_KEY` | `scripts/api-provider-smoke.ts` | macro/report | 일 단위 | Vercel | phase1 미송출 |
| BLS | 고용지표 | `BLS_API_KEY` | `scripts/api-provider-smoke.ts` | macro/report | 월/일 단위 | Vercel | phase1 미송출 |

## Phase 1에서 실제 앱에 쓰는 provider

1. `Data.go.kr`
2. `Naver News`
3. `OpenDART`
4. `KIS runtime_output` 읽기
5. 선택적으로 `KRX`, `Kiwoom` 보강

## Phase 1에서 숨김 처리하는 provider

- Alpaca
- Alpha Vantage
- FMP
- Twelve Data
- Marketaux
- Massive/Polygon
- Coinalyze
- FRED
- BLS

이 provider들은 smoke 및 장래 확장용으로만 유지한다. 현재 홈/탐색 UI에는 국장 카드만 노출한다.
