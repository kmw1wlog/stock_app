# Backend + Frontend Handoff

## 상태

이번 작업으로 `stock_app` 레포 안에 실시간 백엔드 결합 경로를 추가했습니다.

핵심 완료 사항:
- `backend/realtime/` 추가
- KIS 1분봉 + 종목식/조건식 런타임 엔진 연결
- 프론트가 읽는 live feed JSON 브리지 추가
- `/api/live-signals`, `/api/live-alert-triggers`, `/api/cron/live-runtime-sync` 추가
- 홈 화면과 알림 화면을 서버 초기 렌더 기반으로 바꿔 실제 live 데이터가 HTML에도 포함되도록 수정
- DB 적재 worker 초안 추가 (`src/lib/jobs/liveRuntimeSync.ts`, `scripts/sync-live-runtime.ts`)

## 주요 파일

- `backend/realtime/run_live_cycle.py`
- `linux_1m_api_handoff_20260515/realtime_signal_engine.py`
- `linux_1m_api_handoff_20260515/kis_linux_1m_poller.py`
- `src/lib/marketData.ts`
- `src/lib/realtimeBackend.ts`
- `src/lib/jobs/liveRuntimeSync.ts`
- `src/app/api/live-signals/route.ts`
- `src/app/api/live-alert-triggers/route.ts`
- `src/app/api/cron/live-runtime-sync/route.ts`
- `src/components/home/HomePageClient.tsx`
- `src/components/alerts/AlertsPageClient.tsx`

## 데이터 흐름

1. `backend/realtime/run_live_cycle.py`
   - 일봉 selector snapshot 생성
   - KIS 또는 fixture 1분봉 조회
   - 실시간 formula signal 계산
   - `runtime_output/realtime_signals/` 아래 산출물 생성

2. 생성 파일
   - `runtime_output/realtime_signals/formula_signals_latest.json`
   - `runtime_output/realtime_signals/alert_triggers_latest.json`
   - `runtime_output/realtime_signals/frontend/live-feed.json`
   - `runtime_output/realtime_signals/frontend/live-alert-triggers.json`

3. 프론트
   - `src/lib/marketData.ts`가 `live-feed.json`을 최우선으로 읽음
   - 홈 화면은 SSR로 초기 카드 렌더
   - 알림 화면은 SSR로 최근 실시간 감지 섹션 렌더

4. DB worker
   - `scripts/sync-live-runtime.ts`
   - `src/lib/jobs/liveRuntimeSync.ts`
   - `DATABASE_URL`이 있으면 `Asset`, `AssetPriceIntraday`, `AssetTaFeature`, `FormulaSignal`, `ConditionAlertTrigger` 적재
   - 없으면 fallback summary 반환

## 이번 기기에서 확인한 것

### 통과
- `python3 -m unittest tests/test_realtime_signal_engine.py tests/test_kis_live_pipeline.py`
  - 결과: `OK (skipped=1)`
- `PATH=/home/openq/.local/nodejs/current/bin:$PATH npm run typecheck`
  - 결과: 통과
- 실 API smoke
  - `python3 scripts/kis_live_pipeline_smoke.py`
  - 실 KIS 1분봉 수신 확인
- SSR/API 확인
  - `/api/cards/feed` 첫 카드가 `기가비스`, source=`realtime-backend`
  - `/api/live-alert-triggers`에서 push preview 확인

### 제한
- 이 기기에서는 VSCode + Next dev + 브라우저 자동화 + 대용량 데이터 작업이 겹치면 메모리 압박이 큼
- 그래서 Playwright 기반 full UI smoke는 피하고,
  - SSR HTML
  - API 응답
  - deterministic Python integration test
  로 확인하는 경로를 사용함

## 다른 기기 에이전트 권장 검증 순서

1. Node path 세팅
```bash
export PATH=/home/openq/.local/nodejs/current/bin:$PATH
```

2. 타입체크
```bash
npm run typecheck
```

3. deterministic backend integration test
```bash
python3 -m unittest tests/test_realtime_signal_engine.py
```

4. live KIS smoke
```bash
export KIS_ENV=real
export KIS_APP_KEY=...
export KIS_APP_SECRET=...
python3 scripts/kis_live_pipeline_smoke.py
```

5. frontend SSR/API check
```bash
./node_modules/.bin/next dev --webpack -p 3000
curl http://localhost:3000/api/cards/feed
curl http://localhost:3000/
curl http://localhost:3000/alerts
```

6. DB sync check (DB가 있는 환경에서만)
```bash
export DATABASE_URL=...
npm run live:sync
curl -X POST http://localhost:3000/api/cron/live-runtime-sync
```

## 주의

- `Turbopack`은 이 기기에서 file watch limit / 메모리 이슈가 있어 `--webpack` 사용 권장
- 런타임 출력은 `runtime_output/` 아래 생성되며 git ignore 처리됨
- 현재 프론트 화면 송출은 JSON bridge 기반으로 먼저 붙였고, DB 적재는 별도 worker로 확장 가능
