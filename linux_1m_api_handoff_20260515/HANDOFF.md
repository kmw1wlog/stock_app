# Linux 1-Minute Bar Handoff

## 결론
- `KIS`: 리눅스에서 사용 가능
- `Kiwoom REST API`: 리눅스에서 사용 가능
- `최선 우선안`: `KIS`

이유:
- KIS는 공식 문서에 `주식당일분봉조회`, `주식일별분봉조회`, `실시간 (웹소켓) 접속키 발급`, `국내주식 실시간체결가 (KRX)`가 명시되어 있습니다.
- 즉 `1분봉 직접 조회`와 `실시간 체결 기반 보강`을 한 공급자 안에서 처리하기 쉽습니다.
- 키움도 공식 REST/WebSocket 문서상 리눅스 사용은 가능하지만, 이번 handoff 목적이 `가장 빨리 안정적으로 1분봉을 받는 것`이라면 KIS 쪽이 구현 단순성과 운영 안정성에서 더 낫습니다.

## 공식 문서 링크
- KIS API 서비스 개요: https://apiportal.koreainvestment.com/apiservice
- KIS `주식당일분봉조회` endpoint 페이지: https://apiportal.koreainvestment.com/apiservice-apiservice%3F/uapi/domestic-stock/v1/quotations/inquire-time-itemchartprice
- KIS `주식일별분봉조회` endpoint 페이지: https://apiportal.koreainvestment.com/apiservice-apiservice%3F/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice
- KIS 개발자센터/웹소켓 접속키 안내: https://apiportal.koreainvestment.com/provider-doc2
- Kiwoom REST API 메인: https://openapi.kiwoom.com/main
- Kiwoom 서비스 소개: https://openapi.kiwoom.com/intro/serviceInfo
- Kiwoom API 가이드: https://openapi.kiwoom.com/guide/apiguide
- Kiwoom WebSocket 이해/예제: https://openapi.kiwoom.com/m/guide/index?dummyVal=0

## 공식 문서 해석
### KIS
- 공식 서비스 목록에 `주식당일분봉조회`, `주식일별분봉조회`, `주식현재가 당일시간대별체결`, `국내주식 실시간체결가 (KRX)`가 있습니다.
- 운영/개발 서버가 HTTPS/WebSocket 기반이라 리눅스 제약이 없습니다.

### Kiwoom
- 공식 메인 소개에 `다양한 OS 환경과 프로그래밍 언어를 지원`한다고 되어 있습니다.
- 공식 가이드에 REST, WebSocket, 차트, 실시간시세가 모두 존재합니다.
- 따라서 `Kiwoom REST API`는 리눅스에서 가능합니다.
- 다만 `예전 OpenAPI+`가 아니라 `현재 REST API 포털` 기준으로 해석해야 합니다.

## 이번 handoff의 선택
이번 handoff 코드는 `KIS 1분봉 폴링`입니다.

선택 이유:
1. 공식 분봉 endpoint가 존재합니다.
2. Linux에서 바로 `requests`만으로 동작합니다.
3. WebSocket tick aggregation보다 구현과 운영이 단순합니다.
4. 리눅스 Codex가 바로 실행해 검증하기 쉽습니다.

## 파일
- `kis_linux_1m_poller.py`
- `realtime_signal_engine.py`
- `.env.example`
- `requirements.txt`
- `run.sh`

## 기본 사용법
```bash
cd linux_1m_api_handoff_20260515
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
vi .env
bash run.sh once 005930
```

반복 실행:
```bash
bash run.sh loop 005930,000660
```

출력:
- `output/minute_bars_*.jsonl`
- `output/minute_bars_latest.csv`

## 주의
- 기본 TR ID는 `FHKST03010200`로 넣어두었습니다.
- 이 값은 KIS 실사용 예제와 생태계에서 널리 쓰이는 값이지만, 실제 운영 전에는 반드시 현재 포털 문서와 테스트베드에서 재확인하십시오.
- 만약 포털에서 TR ID나 파라미터가 바뀌면 `.env`의 `KIS_MINUTE_TR_ID`를 수정하면 됩니다.

## 다음 단계 권장
1. 이 코드로 `REST 1분봉 폴링`을 먼저 안정화
2. 이후 필요하면 `KIS websocket 실시간체결가`를 붙여 intra-minute tick aggregation 추가
3. closebet/급등주용이면 REST 1분봉 + WebSocket 체결/회원사/프로그램매매를 결합

## 실시간 조건식/종목식 런타임
`realtime_signal_engine.py`는 기존 백테스트 로직을 실시간 백엔드 준비 코드로 묶은 실행기입니다.

구조:
1. `build-selector`
   - 코스닥 일봉 + 공시 증가 + 메자닌/부정기 공시 증가를 합쳐 그날의 종목식 스냅샷을 만듭니다.
2. `run-once`
   - KIS 1분봉 또는 fixture JSONL을 읽어 분봉 조건식을 계산합니다.
   - `formula_signals_latest.json`, `alert_triggers_latest.json` outbox를 생성합니다.
3. `loop`
   - 1분마다 같은 작업을 반복합니다.

### 종목식 스냅샷 생성
```bash
python3 realtime_signal_engine.py build-selector \
  --selector base_selector_score \
  --top-k 50 \
  --out ../runtime_output/realtime_signals/daily_selector_latest.json
```

### fixture 기반 통합 실행
```bash
python3 realtime_signal_engine.py run-once \
  --source fixture \
  --selector-json ../runtime_output/realtime_signals/daily_selector_latest.json \
  --fixture-jsonl /path/to/minute_fixture.jsonl \
  --alerts-json /path/to/alerts.json \
  --out-dir ../runtime_output/realtime_signals \
  --min-amount 1000000 \
  --cooldown-bars 2 \
  --trigger-window-bars 20
```

### KIS 실시간 실행
```bash
python3 realtime_signal_engine.py loop \
  --source kis \
  --selector-json ../runtime_output/realtime_signals/daily_selector_latest.json \
  --alerts-json /path/to/alerts.json \
  --out-dir ../runtime_output/realtime_signals \
  --lookback-minutes 120
```

출력:
- `daily_selector_latest.json`
- `formula_signals_latest.json`
- `alert_triggers_latest.json`

현재 런타임은 JSON outbox 우선 구조입니다. 즉 Node/Prisma 워커가 아직 안 붙어 있어도 Python에서 실시간 계산과 알람 후보 생성까지 먼저 검증할 수 있습니다.

### 라이브 스모크
실제 KIS 자격증명이 있을 때는 아래 스크립트로 공급자 연결과 런타임 ingestion을 빠르게 점검할 수 있습니다.

```bash
export KIS_ENV=real
export KIS_APP_KEY=...
export KIS_APP_SECRET=...
python3 ../scripts/kis_live_pipeline_smoke.py
```
