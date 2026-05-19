# API Runtime Test Report

## Environment

- Date: 2026-05-19
- Branch: `feature/home-feed-card-ui-v1`
- Runtime mode: `DATA_MODE=live`
- Local env: `.env.local`
- Database: not configured locally in this run

## Provider Smoke

Command:

```bash
npm run smoke:providers
```

Result summary:

- passed: 15
- failed: 1
- missing: 2
- process result: pass (`summary.ok=true`)

| Provider | Result | Notes |
|---|---|---|
| Data.go.kr stock | pass | `005930` EOD row returned |
| Data.go.kr ETF | pass | `069500` ETF row returned |
| OpenDART | pass | Samsung Electronics corp code `00126380` returned filings |
| Naver News | pass | `삼성전자` returned 3 news items |
| Alpaca | pass | AAPL snapshot returned |
| FMP | pass | AAPL quote returned |
| Alpha Vantage | pass | AAPL global quote returned |
| Twelve Data | pass | AAPL quote returned |
| Marketaux | pass | AAPL news returned |
| Massive/Polygon | pass | AAPL prev aggregate returned |
| FRED | pass | `DGS10` latest observation returned |
| BLS | pass | unemployment series rows returned |
| Coinalyze | pass | BTC perpetual open interest returned |
| KIS token | pass | token issued |
| Kiwoom token | pass | token issued |
| Kiwoom KR short/flow | partial pass | token issued and downstream REST calls now return `return_code=0`, but meaningful rows are still empty |
| Database | missing | `DATABASE_URL` absent locally |
| KRX Open API | missing | `KRX_SHORT_SELLING_API_ID`, `KRX_INVESTOR_FLOW_API_ID` missing |

## Official-doc Findings

- Kiwoom OAuth token endpoint is correct: `POST /oauth2/token` on `https://api.kiwoom.com`.
- Kiwoom investor chart TR is `ka10060` on `/api/dostk/chart`.
- Kiwoom stock code format should use exchange prefix, e.g. `KRX:005930`.
- Even after correcting `ka10060` and `KRX:005930`, downstream Kiwoom flow endpoints still rejected the issued token in this environment.

Inference from official docs + runtime behavior:

- token 발급은 성공
- downstream 단건 조회도 `return_code=0` 응답까지는 올라옴
- 다만 현재 샘플 호출에서는 공매도/대차/투자자 수급 row가 비어 있어, 실제 의미 있는 실데이터 적재 검증은 추가 TR/장중 데이터로 이어서 확인 필요

## App Rendering Verification

Local dev verification was run against `http://127.0.0.1:3401`.

### Detail API

Command used:

```bash
curl /api/cards/detail?...symbol=005930...
```

Observed:

- `providers.news = "api"`
- `providers.disclosures = "api"`
- `newsCount = 3`
- `disclosureCount = 3`
- first disclosure URL resolved to direct DART receipt URL

### Browser verification

Playwright mobile viewport checks:

- Home card rendered
- Back detail opened from the card
- `뉴스·공시·반응 이유` present
- `알람 둘러보기` present
- `종목진단 상세` present
- `외부 바로가기` present

## Smoke Pre APK

Command:

```bash
SMOKE_BASE_URL=http://127.0.0.1:3401 npm run smoke:pre-apk
```

Result:

- `/`: pass
- `/alerts`: pass
- `/api/cards/feed?mode=fast`: pass
- `/api/live-signals`: pass
- `/api/live-alert-triggers`: pass
- `/api/cron/live-runtime-sync`: pass
- `condition-alerts CRUD`: pass
- fixture live trigger seed: pass

## Remaining Gaps

1. Local DB persistence is not verified until `DATABASE_URL` is supplied.
2. KRX direct API still needs the two API IDs in addition to auth key.
3. Kiwoom downstream data TRs need separate resolution even though OAuth token issuance works.
4. KIS real-time worker is still a separate worker deployment concern, not a Vercel runtime concern.
