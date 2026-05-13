# Changelog

## 0.4.0 - Data Display MVP

- 버전 상수를 `0.4.0-data-mvp`로 추가했습니다.
- `DATA_MODE=live`에서 mock 가격, 등락률, 차트가 노출되지 않도록 카드 feed와 차트 정책을 정리했습니다.
- 홈, 탐색, 랭킹, 보관함, 리포트를 공식 API/DB/위젯 기반 데이터 화면으로 전환했습니다.
- 프리미엄 잠금 UI와 사용자 내부 행동 기반 문구를 화면에서 제거했습니다.
- Data.go.kr, OpenDART, Naver News, SEC EDGAR, Binance, Upbit, Alternative Fear & Greed 기반 cron/API 파이프라인을 보강했습니다.
- `/api/provider-status`, `/api/admin/refresh-all`, `/data-status`를 추가했습니다.
- PWA manifest와 기본 아이콘을 추가했습니다.

