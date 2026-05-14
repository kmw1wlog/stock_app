# Unimplemented Items

Last updated: 2026-05-14

## 국장 시간외 단일가

- 구현 상태: 미구현.
- 구현하지 못한 이유: 무료로 안정적인 공식 상업용 조회 API를 아직 확정하지 못했다.
- 필요한 API 키 또는 권한: KIS, Kiwoom, 대신, KRX/Koscom 또는 상업용 데이터 계약.
- 현재 앱 fallback: 시간외 섹션은 `데이터 준비중`으로 표시한다.
- 다음 단계: 공식 provider 권한을 확정한 뒤 DB 저장 job과 화면 섹션을 연결한다.

## KRX 공매도 direct API

- 구현 상태: KRX direct는 차단됨. Kiwoom REST 대체 provider는 구현됨.
- 구현하지 못한 이유: `KRX_OPENAPI_AUTH_KEY`는 있으나 direct 공매도 호출에 필요한 `KRX_SHORT_SELLING_API_ID`가 비어 있다.
- 필요한 API 키 또는 권한: KRX 공매도 API ID 또는 KRX/Koscom 데이터 계약.
- 현재 앱 fallback: KRX direct는 비활성. 앱은 Kiwoom REST `ka10014` 공매도추이요청 결과를 `GET /api/korea/short-flow`와 홈 카드로 송출한다.
- 다음 단계: KRX API ID 확보 후 KRX direct 결과와 Kiwoom 결과를 병렬 비교한다.

## KRX 투자자별 수급 direct API

- 구현 상태: KRX direct는 차단됨. Kiwoom REST 대체 provider는 구현됨.
- 구현하지 못한 이유: `KRX_INVESTOR_FLOW_API_ID`가 비어 있어 KRX direct URL을 만들 수 없다.
- 필요한 API 키 또는 권한: KRX 투자자별 수급 API ID, Kiwoom/KIS 조회 권한, 또는 Koscom/상업용 데이터 계약.
- 현재 앱 fallback: Kiwoom REST `ka10059` 종목별투자자기관별요청으로 개인/외국인/기관 데이터를 송출한다.
- 다음 단계: 상업 배포 전 Kiwoom/KRX/Koscom 재표시 권리를 확인한다.

## 국장 대차거래 direct KRX/KSD 데이터

- 구현 상태: KRX/KSD direct는 미구현. Kiwoom REST 대체 provider는 구현됨.
- 구현하지 못한 이유: 대차 원시 데이터는 상업 재표시 제한 가능성이 있어 공식 권리 확인이 필요하다.
- 필요한 API 키 또는 권한: 한국예탁결제원/KRX/Koscom 데이터 계약 또는 증권사 API 재표시 권한.
- 현재 앱 fallback: Kiwoom REST `ka20068` 대차거래추이요청 결과를 라벨/요약으로 송출한다.
- 다음 단계: 상업 배포 전 원시값 재표시 범위와 라벨화 가능 범위를 확인한다.

## 미장 직접 가격 API 운영 검증

- 구현 상태: 부분 구현.
- 구현하지 못한 이유: Alpaca/FMP/Alpha Vantage/Twelve Data provider는 optional이며 운영 DB 적재는 아직 검증하지 않았다.
- 필요한 API 키 또는 권한: `US_DIRECT_PRICE_PROVIDER=alpaca|fmp|alphaVantage|twelveData`와 선택 provider 키.
- 현재 앱 fallback: 직접 가격 데이터가 없으면 TradingView 공식 위젯만 표시하고 자체 등락률은 만들지 않는다.
- 다음 단계: 선택 provider 하나를 운영 env에 고정하고 `/api/cron/us-direct-quotes` 저장 결과를 검증한다.

## OpenDART 전체 corpCode 매핑

- 구현 상태: 부분 구현.
- 구현하지 못한 이유: `dartCorpCode`가 없는 국장 자산은 공시 조회를 건너뛴다.
- 필요한 API 키 또는 권한: `OPENDART_API_KEY`, corpCode ZIP 조회/파싱 검증.
- 현재 앱 fallback: corpCode 없는 종목은 공시 데이터 준비중.
- 다음 단계: corpCode mapping job을 안정화하고 seed 자산에 corpCode를 채운다.

## FRED/BLS 매크로 라벨

- 구현 상태: API smoke 성공, 앱 라벨 미연결.
- 구현하지 못한 이유: 이번 변경에서는 API 수신 검증까지 완료했고, 시장 매크로 라벨 모델/화면 연결은 아직 하지 않았다.
- 필요한 API 키 또는 권한: `FRED_API_KEY`, `BLS_API_KEY`.
- 현재 앱 fallback: 매크로 라벨 비노출.
- 다음 단계: CPI, 고용, 금리 시계열을 저장하고 시장 환경 라벨을 만든다.

## Coinalyze funding/OI

- 구현 상태: API smoke 성공, 앱 라벨 미연결.
- 구현하지 못한 이유: open interest 응답 수신은 성공했지만 funding/OI 저장 모델과 레버리지 라벨 생성은 아직 연결하지 않았다.
- 필요한 API 키 또는 권한: `COINALYZE_API_KEY`.
- 현재 앱 fallback: funding/OI 라벨 비노출 또는 자료 준비중.
- 다음 단계: funding/OI provider를 추가하고 롱 과열/숏 과열/중립 라벨을 저장한다.

## Massive/Polygon Flat Files

- 구현 상태: REST aggregate API smoke 성공, S3 flat files 미연결.
- 구현하지 못한 이유: S3-compatible flat file 연동은 AWS 서명, 파일 경로, 배치 처리 설계가 필요하다.
- 필요한 API 키 또는 권한: `MASSIVE_S3_ACCESS_KEY_ID`, `MASSIVE_S3_SECRET_ACCESS_KEY`, `MASSIVE_S3_ENDPOINT`, `MASSIVE_S3_BUCKET`.
- 현재 앱 fallback: Polygon/Massive REST aggregate smoke만 문서화.
- 다음 단계: 일봉/분봉 bulk ingest job을 별도 설계한다.

## KIS 실시간/수급 앱 연결

- 구현 상태: 인증 토큰 smoke 성공, 시세/수급 provider 미연결.
- 구현하지 못한 이유: KIS 제휴 안내에 따르면 제3자 서비스의 시세 재표시에는 거래소/코스콤 정보이용계약 이슈가 있을 수 있다.
- 필요한 API 키 또는 권한: `KIS_API_KEY`, `KIS_API_SECRET`, 계좌 권한, 데이터 재표시 권리.
- 현재 앱 fallback: Kiwoom REST와 Data.go.kr EOD를 우선 사용한다.
- 다음 단계: KIS provider는 재표시 권리 확인 후 quote-only endpoint부터 연결한다.

## Play Store/App Store 네이티브 래핑

- 구현 상태: 미구현.
- 구현하지 못한 이유: 이번 버전 범위는 Next.js PWA/Vercel 배포 가능 상태까지다.
- 필요한 API 키 또는 권한: 스토어 개발자 계정, 앱 서명, TWA 또는 Capacitor 설정.
- 현재 앱 fallback: PWA manifest 제공.
- 다음 단계: TWA 또는 Capacitor 패키징을 별도 작업으로 진행한다.
