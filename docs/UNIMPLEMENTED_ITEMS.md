# Unimplemented Items

## 국장 시간외 단일가

- 기능명: 국장 시간외 단일가
- 구현 상태: 미구현
- 구현하지 못한 이유: 무료로 안정적인 상업적 조회 가능한 공식 API를 확정하지 못했습니다.
- 필요한 API 키 또는 외부 권한: KRX/KIS/증권사 API 또는 데이터 제휴
- 현재 앱에서의 fallback 처리: 시간외 섹션은 `데이터 준비중`으로 표시합니다.
- 향후 구현 방법: KIS/키움/대신/상업용 KRX provider를 추가하고 DB 저장 후 화면에 연결합니다.

## KRX 공매도

- 기능명: KRX 공매도
- 구현 상태: 부분 구현
- 구현하지 못한 이유: KRX Open API 인증키와 정확한 API ID/권한이 확정되어야 합니다.
- 필요한 API 키 또는 외부 권한: `KRX_OPENAPI_AUTH_KEY`, `KRX_SHORT_SELLING_API_ID`
- 현재 앱에서의 fallback 처리: `공매도 자료 준비중`, `KRX 조회 불가 · 라벨 비활성`
- 향후 구현 방법: KRX provider 응답 포맷을 운영 키로 검증하고 AssetLabel 저장 로직을 활성화합니다.

## KRX 투자자별 수급

- 기능명: 기관/외국인 수급
- 구현 상태: 부분 구현
- 구현하지 못한 이유: KRX API ID 또는 대체 증권사 API 권한이 필요합니다.
- 필요한 API 키 또는 외부 권한: `KRX_INVESTOR_FLOW_API_ID` 또는 KIS/키움/대신 API 권한
- 현재 앱에서의 fallback 처리: `수급 자료 준비중`
- 향후 구현 방법: KRX/KIS provider를 통해 기관/외국인 순매수 데이터를 저장하고 라벨을 생성합니다.

## 미장 직접 가격 API 운영 검증

- 기능명: 미장 직접 가격/등락률 계산
- 구현 상태: 부분 구현
- 구현하지 못한 이유: provider 코드는 추가했지만, 운영 DB와 env가 없는 현재 로컬에서는 실제 적재를 검증하지 못했습니다.
- 필요한 API 키 또는 외부 권한: `US_DIRECT_PRICE_PROVIDER=alpaca|fmp|alphaVantage|twelveData`, provider별 API 키
- 현재 앱에서의 fallback 처리: 직접 가격 데이터가 없으면 TradingView 위젯으로 가격/차트를 표시하고 자체 등락률은 표시하지 않습니다.
- 향후 구현 방법: 운영 env 설정 후 `/api/cron/us-direct-quotes`를 실행하고 `AssetPriceDaily` 적재를 확인합니다.

## FRED/BLS 매크로 라벨

- 기능명: 미장 매크로 환경 라벨
- 구현 상태: 미구현
- 구현하지 못한 이유: 이번 턴에서는 가격/뉴스/provider 상태 보강을 우선했습니다.
- 필요한 API 키 또는 외부 권한: `FRED_API_KEY`, `BLS_API_KEY`
- 현재 앱에서의 fallback 처리: 매크로 라벨 미노출
- 향후 구현 방법: CPI, 실업률, 금리 시계열을 저장하고 시장 환경 라벨을 생성합니다.

## Coinalyze funding/OI

- 기능명: 코인 funding rate/OI 라벨
- 구현 상태: 미구현
- 구현하지 못한 이유: 거래소 가격/캔들 pipeline이 우선이며, Coinalyze 응답과 상업 노출 정책 검증이 필요합니다.
- 필요한 API 키 또는 외부 권한: `COINALYZE_API_KEY`
- 현재 앱에서의 fallback 처리: 레버리지/미결제약정 라벨 미노출 또는 자료 준비중
- 향후 구현 방법: funding/OI provider를 추가하고 원시값 대신 롱 과열/숏 과열/중립 라벨을 저장합니다.

## Play Store/App Store 네이티브 래핑

- 기능명: TWA/Capacitor 스토어 패키징
- 구현 상태: 미구현
- 구현하지 못한 이유: 이번 범위는 Next.js PWA/Vercel 배포 가능 상태까지입니다.
- 필요한 API 키 또는 외부 권한: 스토어 개발자 계정, 패키지 서명, TWA 또는 Capacitor 설정
- 현재 앱에서의 fallback 처리: PWA manifest를 제공합니다.
- 향후 구현 방법: TWA 또는 Capacitor 프로젝트를 별도 생성하고 웹 앱 URL을 래핑합니다.
