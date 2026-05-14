# Changelog

## 0.5.0 - Live Data Display MVP

- 작업 브랜치: `feature/v0.5.0-live-data`
- 목표: 실제 API, 공식 공개 조회, 공식 위젯 기반 데이터를 앱 화면에 렌더링.
- `DATA_MODE=live`에서 mock 가격, 등락률, 차트를 표시하지 않는 정책을 유지한다.
- provider 실행 결과, runtime smoke test, 미구현 항목을 문서화한다.

## 0.4.0 - Data Display MVP

- 버전 상수를 `0.4.0-data-mvp`로 추가했습니다.
- `DATA_MODE=live`에서 mock 가격, 등락률, 차트가 노출되지 않도록 카드 feed와 차트 정책을 정리했습니다.
- 홈, 탐색, 랭킹, 보관함, 리포트를 공식 API/DB/위젯 기반 데이터 화면으로 전환했습니다.
- 프리미엄 잠금 UI와 사용자 내부 행동 기반 문구를 화면에서 제거했습니다.
- Data.go.kr, OpenDART, Naver News, SEC EDGAR, Binance, Upbit, Alternative Fear & Greed 기반 cron/API 파이프라인을 보강했습니다.
- `/api/provider-status`, `/api/admin/refresh-all`, `/data-status`를 추가했습니다.
- PWA manifest와 기본 아이콘을 추가했습니다.

## Unreleased

- Alpaca/FMP/Alpha Vantage/Twelve Data 미장 직접 가격 provider 후보와 `/api/cron/us-direct-quotes`를 추가했습니다.
- Marketaux 뉴스 provider와 `/api/cron/marketaux-news`를 추가했습니다.
- API 수집 데이터와 공식 위젯/사이트 표시 데이터를 분리한 `docs/DATA_SOURCE_STRATEGY.md`를 추가했습니다.
- seed 데이터의 깨진 한글 문구를 정리했습니다.
