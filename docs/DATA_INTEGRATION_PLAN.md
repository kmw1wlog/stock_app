# Data Integration Plan

## 목표

`stock_app`에서 실데이터가 웹 URL, APK, AAB에 동일하게 보이도록 한다. 데이터 연동의 본체는 `stock_app` 서버/API/DB/worker이며, `phone_stock_app`은 Production URL을 여는 WebView wrapper다.

## 현재 우선순위

1. 국장 전용 홈/탐색 송출 유지
2. 홈 첫 응답은 빠르게 유지
3. 뒷면 뉴스/공시/알람 둘러보기가 실데이터 기반으로 보이게 만들기
4. 장중 실시간은 별도 worker에서 `runtime_output` 또는 DB를 갱신

## 데이터 계층

### 1순위: runtime JSON

- `runtime_output/realtime_signals/frontend/live-feed.json`
- `runtime_output/realtime_signals/frontend/live-alert-triggers.json`
- `runtime_output/realtime_signals/formula_signals_latest.json`

장점:
- 장중 실시간성
- 홈 `mode=fast` 응답에 적합

### 2순위: DB

- `Asset`
- `AssetPriceDaily`
- `AssetPriceIntraday`
- `NewsMention`
- `ConditionAlertTrigger`
- `DataProviderStatus`

장점:
- 외부 API 장애 시 화면 유지
- 뉴스/공시/라벨 선계산 가능

### 3순위: provider direct fetch

- `Naver News`
- `OpenDART`
- `Data.go.kr`
- `Kiwoom REST`
- `KRX Open API`

원칙:
- 홈 첫 HTML 응답에서 무겁게 blocking하지 않는다.
- 뒷면 상세나 cron/job에서 우선 사용한다.

### 4순위: fallback

- 국장 기본 관심 카드
- 뉴스/공시 검색 입구
- sample chart

원칙:
- `기본 관심종목`, `fast fallback`, `default-watchlist` 같은 내부 문구를 사용자에게 그대로 보여주지 않는다.

## Phase 1 구현 범위

### A. 문서/인벤토리

- `docs/API_PROVIDER_INVENTORY.md`
- `docs/DATA_ENV_MATRIX.md`
- provider별 env와 호출 주기 정리

### B. provider smoke

- `npm run smoke:providers`
- 개별 API 연결 확인
- env alias 처리
- secret 직접 출력 금지

### C. 앱 렌더링

- 홈 카드 앞면은 KR only 유지
- 뒷면 뉴스는 `Naver News` live 또는 검색 fallback
- 뒷면 공시는 `OpenDART` live 또는 검색 fallback
- 뒷면 알람 둘러보기는 backend A-O catalog 기반

### D. provider status

- `/api/provider-status`
- 앱에서 provider 연결 상태 확인 가능

## Phase 2

- DB 적재 jobs 정리
- `naverNewsJob`
- `dartJob`
- `koreaEodJob`
- `krx/kiwoom` flow job

## Phase 3

- KIS worker 배포
- `run_live_cycle.py` / `realtime_signal_engine.py`
- `runtime_output` 및 DB 동시 적재

## APK/AAB 영향

데이터 연동만 바뀌는 경우:

- `phone_stock_app` 수정 불필요
- AAB 재빌드 불필요
- Production URL 갱신만으로 앱 화면 반영

네이티브 WebView/appId/permission 변경 시에만 AAB 재빌드가 필요하다.
