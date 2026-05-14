# Unimplemented Items

## 국장 시간외 단일가

- 구현 상태: 미구현.
- 구현하지 못한 이유: 무료로 안정적인 상업 노출 가능한 공식 API를 확정하지 못했다.
- 필요한 API 키 또는 권한: KRX/KIS/키움/대신 API 또는 상업용 데이터 제휴.
- 현재 앱 fallback: 시간외 데이터는 `데이터 준비중` 또는 섹션 비노출.
- 다음 단계: 공식 provider 권한을 확정한 뒤 DB 저장 job과 화면 섹션을 연결한다.

## KRX 공매도

- 구현 상태: 차단/부분 구현.
- 구현하지 못한 이유: KRX Open API 인증키 외에 정확한 API ID, 권한, 응답 포맷 검증이 필요하다.
- 필요한 API 키 또는 권한: `KRX_OPENAPI_AUTH_KEY`, `KRX_SHORT_SELLING_API_ID`.
- 현재 앱 fallback: `공매도 자료 준비중`, `KRX 조회 불가 · 라벨 비활성`.
- 다음 단계: 운영 키로 실제 응답을 받아 normalize/save/label 로직을 완성한다.

## KRX 투자자별 수급

- 구현 상태: 차단/부분 구현.
- 구현하지 못한 이유: 투자자별 순매수 조회 API ID와 권한이 확정되지 않았다.
- 필요한 API 키 또는 권한: `KRX_INVESTOR_FLOW_API_ID` 또는 KIS/키움/대신 API 권한.
- 현재 앱 fallback: `수급 자료 준비중`.
- 다음 단계: 공식 provider 응답 포맷 확인 후 기관/외국인 수급 라벨을 저장한다.

## 미장 직접 가격 API 운영 검증

- 구현 상태: 부분 구현.
- 구현하지 못한 이유: Alpaca/FMP/Alpha Vantage/Twelve Data provider는 optional이며, 현재 로컬에는 운영 DB/env가 없어 저장까지 검증하지 못했다.
- 필요한 API 키 또는 권한: `US_DIRECT_PRICE_PROVIDER=alpaca|fmp|alphaVantage|twelveData`와 선택 provider 키.
- 현재 앱 fallback: 직접 가격 데이터가 없으면 TradingView 공식 위젯만 표시하고 자체 등락률은 만들지 않는다.
- 다음 단계: 선택 provider 하나를 운영 env에 설정하고 `/api/cron/us-direct-quotes` 저장 결과를 검증한다.

## OpenDART 전체 corpCode 매핑

- 구현 상태: 부분 구현.
- 구현하지 못한 이유: `dartCorpCode`가 없는 국장 자산은 공시 조회를 건너뛴다.
- 필요한 API 키 또는 권한: `OPENDART_API_KEY`, corpCode ZIP 조회/파싱 검증.
- 현재 앱 fallback: corpCode 없는 종목은 공시 데이터 준비중.
- 다음 단계: corpCode mapping job을 안정화하고 seed 자산에 corpCode를 채운다.

## FRED/BLS 매크로 라벨

- 구현 상태: 미구현.
- 구현하지 못한 이유: 이번 버전은 가격/공시/뉴스/코인 public provider 렌더링을 우선했다.
- 필요한 API 키 또는 권한: `FRED_API_KEY`, `BLS_API_KEY`.
- 현재 앱 fallback: 매크로 라벨 비노출.
- 다음 단계: CPI, 고용, 금리 시계열을 저장하고 시장 환경 라벨을 만든다.

## Coinalyze funding/OI

- 구현 상태: 미구현.
- 구현하지 못한 이유: 이번 버전은 Binance/Upbit 가격/캔들 및 Alternative Fear & Greed를 우선했다.
- 필요한 API 키 또는 권한: `COINALYZE_API_KEY`.
- 현재 앱 fallback: funding/OI 라벨 비노출 또는 자료 준비중.
- 다음 단계: funding/OI provider를 추가하고 롱 과열/숏 과열/중립 라벨을 저장한다.

## Play Store/App Store 네이티브 래핑

- 구현 상태: 미구현.
- 구현하지 못한 이유: 이번 버전 범위는 Next.js PWA/Vercel 배포 가능 상태까지다.
- 필요한 API 키 또는 권한: 스토어 개발자 계정, 앱 서명, TWA 또는 Capacitor 설정.
- 현재 앱 fallback: PWA manifest 제공.
- 다음 단계: TWA 또는 Capacitor 프로젝트를 별도 생성하고 배포 URL을 래핑한다.
