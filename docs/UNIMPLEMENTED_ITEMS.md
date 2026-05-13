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

## 미장 직접 가격 API

- 기능명: 미장 직접 가격/등락률 계산
- 구현 상태: 미구현
- 구현하지 못한 이유: 운영 가능한 Twelve Data/Polygon/Alpaca provider 키와 rate limit 정책을 확정하지 않았습니다.
- 필요한 API 키 또는 외부 권한: `TWELVE_DATA_API_KEY`, `POLYGON_API_KEY`, `ALPACA_API_KEY_ID`, `ALPACA_API_SECRET_KEY`
- 현재 앱에서의 fallback 처리: TradingView 위젯으로 가격/차트를 표시하고 자체 등락률은 표시하지 않습니다.
- 향후 구현 방법: `US_DIRECT_PRICE_PROVIDER`별 provider를 추가하고 AssetPriceDaily/Intraday에 저장합니다.

## Play Store/App Store 네이티브 래핑

- 기능명: TWA/Capacitor 스토어 패키징
- 구현 상태: 미구현
- 구현하지 못한 이유: 이번 범위는 Next.js PWA/Vercel 배포 가능 상태까지입니다.
- 필요한 API 키 또는 외부 권한: 스토어 개발자 계정, 패키지 서명, TWA 또는 Capacitor 설정
- 현재 앱에서의 fallback 처리: PWA manifest를 제공합니다.
- 향후 구현 방법: TWA 또는 Capacitor 프로젝트를 별도 생성하고 웹 앱 URL을 래핑합니다.

