# Realtime Backend

이 폴더는 `stock_app` 안에서 프론트와 함께 운영되는 실시간 백엔드 엔트리포인트를 둡니다.

구성:
- `run_live_cycle.py`
  - 일봉 종목식 스냅샷 생성
  - KIS 1분봉 실시간 조회 또는 fixture 입력
  - 종단면 조건식 계산
  - 프론트가 읽는 `runtime_output/realtime_signals/frontend/live-feed.json` 생성
- 추후 여기에 DB 적재 워커와 푸시 발송 워커를 추가합니다.

현재 핵심 런타임 구현은
`linux_1m_api_handoff_20260515/realtime_signal_engine.py`
에 있으며, 이 폴더의 스크립트는 앱 레포 관점의 백엔드 엔트리포인트 역할을 합니다.
