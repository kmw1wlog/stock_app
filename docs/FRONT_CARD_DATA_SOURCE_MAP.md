# Front Card Data Source Map

홈 앞면 카드는 홈 첫 응답 속도를 지키기 위해 실시간 provider 직조회보다 `runtime/front cache → DB → fallback` 순서를 우선한다.

| 필드 | 우선 provider | fallback | 현재 구현 상태 |
|---|---|---|---|
| 현재가 | `runtime_output/realtime_signals/frontend/front-feed.json` → `live-feed.json` → DB intraday/daily | 가격 확인중 | 1차 구현 |
| 등락률 | `front-feed.json` → `live-feed.json` → DB daily | 보합 | 1차 구현 |
| 거래대금 | `front-feed.json` technical snapshot / latest candle → DB daily | 거래대금 확인중 | 1차 구현 |
| 거래량 증가율 | `front-feed.json` technical snapshot / latest candle 평균비 | 전일 대비 확인중 | 1차 구현 |
| 전고점/고가권 | `front-feed.json` 20일 캔들 계산값 → runtime technical snapshot → DB TA feature | 전고점 확인중 / 고가권 확인 | 1차 구현 |
| 지수대비 강도 | 종목 등락률 - KOSPI/KOSDAQ proxy ETF 변화율 | 지수대비 확인중 / 시장대비 강세 | 1차 구현 |
| 핵심 문장 | `front-feed.json` headline → runtime/live signal reason → card copy helper | 시장 흐름 확인 | 1차 구현 |
| 뉴스 소문장 | `front-feed.json` newsSubline → detail API/Naver 기반 일반화 문장 | 관련 뉴스와 시장 반응을 함께 확인 중 | 구현 |
| 알림 조건 | `front-feed.json` alertConditionLabel → formula mapping | 같은 흐름 재감지 | 구현 |

## 현재 현실적인 provider 판단

### 이미 연결 가능한 것

- `DATA_GO_KR_SERVICE_KEY`
  - 현재가에 가까운 최신 일자 가격
  - 등락률
  - 거래량
  - 거래대금
  - 일봉 캔들 기반 전고점/거래비율 계산
- `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`
  - 뉴스 title/link
- `OPENDART_API_KEY`
  - 공시 메타데이터
- `runtime_output/realtime_signals/frontend/live-feed.json`
  - worker가 있으면 장중 실시간 card snapshot

### 아직 부족한 것

- `DATABASE_URL`
  - DB 적재가 없으면 Vercel cold start 시 카드 데이터 재사용성이 낮다.
- `KIS worker`
  - 장중 1분봉 실시간 현재가/누적거래대금/실시간 조건식은 별도 worker 필요
- `KRX_OPENAPI_AUTH_KEY` + API IDs
  - 정식 지수/공매도/투자자 수급 보강 가능
- `Kiwoom REST`
  - 수급/공매도 보강 가능하지만 현재 smoke 기준 실조회 TR이 막혀 있음

## 지수대비 계산 주의

현재 1차 구현은 `KOSPI/KOSDAQ` 직접 지수 feed 대신 아래 proxy를 사용한다.

- KOSPI proxy: `069500`
- KOSDAQ proxy: `229200`

즉, 앞면 `지수대비 +2.4%p`는 현재 단계에서 proxy ETF 변화율 기준 근사치다. KRX/KIS index feed 또는 DB 적재가 붙으면 정식 지수 기준으로 교체한다.
