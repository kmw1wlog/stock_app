# Unimplemented Items

Last updated: 2026-05-14

## 국장 시간외 단일가

- 구현 상태: 부분 구현.
- 구현하지 못한 이유: KRX 직접 연동은 API ID/계약 정보가 부족하고, 포털/웹사이트 우회 크롤링은 약관·권리 문제가 있어 사용하지 않았다. 이번 작업에서는 Kiwoom REST `ka10087` 시간외단일가요청을 합법적 후보 source로 선정하고 provider/cron/DB 모델까지 구현했다.
- 필요한 API 키 또는 외부 권한: `KIWOOM_APP_KEY`, `KIWOOM_SECRET_KEY` 또는 기존 `KIWOOM_REST_API_KEY`, `KIWOOM_REST_API_SECRET`; 운영 계정에서 `ka10087` 응답 포맷 검증 필요.
- 현재 앱 fallback: 상세 진단과 “왜 떴나요?” 영역에는 `자료 없음` 또는 `시간외 데이터 제공처 확인 필요` 성격의 라벨만 표시한다. 임의 시간외 가격은 만들지 않는다.
- 향후 구현 방법: 운영 Kiwoom env로 `/api/cron/after-hours` 실행 후 `AfterHoursQuoteDaily` 저장값을 검증하고, 필요하면 KRX/Koscom 데이터 계약 또는 KIS/키움 공식 endpoint를 병렬 provider로 추가한다.

## KRX 공매도 direct API

- 구현 상태: KRX direct는 차단, Kiwoom REST 대체 provider 사용.
- 구현하지 못한 이유: `KRX_OPENAPI_AUTH_KEY`는 있으나 direct 공매도 호출에 필요한 `KRX_SHORT_SELLING_API_ID`가 비어 있다.
- 필요한 API 키 또는 외부 권한: KRX 공매도 API ID 또는 KRX/Koscom 데이터 계약.
- 현재 앱 fallback: KRX direct가 비활성일 때 Kiwoom REST `ka10014` 결과를 라벨/요약으로 사용한다. fake 공매도 라벨은 만들지 않는다.
- 향후 구현 방법: KRX API ID 확보 후 KRX direct 결과와 Kiwoom 결과를 병렬 비교한다.

## KRX 투자자별 수급 direct API

- 구현 상태: KRX direct는 차단, Kiwoom REST 대체 provider와 DB 저장 route 구현.
- 구현하지 못한 이유: `KRX_INVESTOR_FLOW_API_ID`가 없어 KRX direct URL을 만들 수 없다.
- 필요한 API 키 또는 외부 권한: KRX 투자자별 수급 API ID, Kiwoom/KIS 조회 권한, 또는 Koscom/상업용 데이터 계약.
- 현재 앱 fallback: `/api/cron/kiwoom-investor-flow`가 Kiwoom REST `ka10059`를 통해 `InvestorFlowDaily` 저장을 시도하고, 상세 진단은 숫자 대신 `기관·외인 동반 매집`, `기관 매집 우위`, `혼조`, `매도 우위` 라벨로 표시한다.
- 향후 구현 방법: 운영 env로 EOD 수집을 검증하고, 권리 확인 후 KRX/Koscom provider를 추가한다.

## 국장 대차거래 direct KRX/KSD 데이터

- 구현 상태: KRX/KSD direct 미구현. Kiwoom REST `ka20068` 요약만 보조 source로 사용.
- 구현하지 못한 이유: 대차 데이터는 상업 재표시 제한 가능성이 있어 권리 확인이 필요하다.
- 필요한 API 키 또는 외부 권한: 한국예탁결제원, KRX/Koscom 데이터 계약 또는 증권사 API 재표시 권한.
- 현재 앱 fallback: 대차 원자료 숫자는 앱 UI에 노출하지 않는다.
- 향후 구현 방법: 상업 배포 전 재표시 가능 범위와 라벨화 가능 범위를 확인한다.

## 미장 직접 가격 API 운영 검증

- 구현 상태: 부분 구현.
- 구현하지 못한 이유: Alpaca/FMP/Alpha Vantage/Twelve Data provider는 optional이며 운영 DB 적재까지는 아직 고정 검증하지 않았다.
- 필요한 API 키 또는 외부 권한: `US_DIRECT_PRICE_PROVIDER=alpaca|fmp|alphaVantage|twelveData`와 선택 provider 키.
- 현재 앱 fallback: 직접 가격 데이터가 없으면 TradingView 공식 위젯만 표시하고 자체 등락률은 만들지 않는다.
- 향후 구현 방법: 선택 provider 하나를 운영 env로 고정하고 `/api/cron/us-direct-quotes` 저장 결과를 검증한다.

## OpenDART 전체 corpCode 매핑

- 구현 상태: 부분 구현.
- 구현하지 못한 이유: `dartCorpCode`가 없는 국장 자산은 공시 조회를 건너뛴다.
- 필요한 API 키 또는 외부 권한: `OPENDART_API_KEY`, corpCode ZIP 조회/파싱 검증.
- 현재 앱 fallback: corpCode 없는 종목은 공시 데이터 준비중으로 표시한다.
- 향후 구현 방법: corpCode mapping job을 안정화하고 seed 자산에 corpCode를 채운다.

## FRED/BLS 매크로 라벨

- 구현 상태: API smoke 성공, 앱 라벨 미연결.
- 구현하지 못한 이유: 이번 변경은 상세 진단/MTS/시간외/EOD 마무리에 집중했다.
- 필요한 API 키 또는 외부 권한: `FRED_API_KEY`, `BLS_API_KEY`.
- 현재 앱 fallback: 매크로 라벨 비노출.
- 향후 구현 방법: CPI, 고용, 금리 시계열을 저장하고 시장 환경 라벨을 만든다.

## Coinalyze funding/OI

- 구현 상태: API smoke 성공, 앱 라벨 미연결.
- 구현하지 못한 이유: funding/OI 저장 모델과 레버리지 라벨 생성은 아직 연결하지 않았다.
- 필요한 API 키 또는 외부 권한: `COINALYZE_API_KEY`.
- 현재 앱 fallback: funding/OI 라벨 비노출 또는 자료 준비중.
- 향후 구현 방법: funding/OI provider를 추가하고 롱 과열/숏 과열/중립 라벨로 저장한다.

## Play Store/App Store 네이티브 래핑

- 구현 상태: 미구현.
- 구현하지 못한 이유: 이번 버전 범위는 Next.js PWA/Vercel 배포 가능 상태까지다.
- 필요한 API 키 또는 외부 권한: 스토어 개발자 계정, 앱 서명, TWA 또는 Capacitor 설정.
- 현재 앱 fallback: PWA manifest 제공.
- 향후 구현 방법: TWA 또는 Capacitor 패키징을 별도 작업으로 진행한다.
