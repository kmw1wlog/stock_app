# Real Data Rendering Test Report

## Environment

- Date: 2026-05-19
- Branch: `feature/home-feed-card-ui-v1`
- App URL under local verification: `http://127.0.0.1:3402`
- Production target URL: `https://stock-app-mu-three.vercel.app/`

## Rendering Policy

Current phase is Korean-equity-first.

- Home/Explore UI shows KR cards only
- US/crypto providers may still exist in the codebase, but are not the active phase-1 UI surface
- Home first response should stay fast by preferring runtime/DB/fallback over blocking provider fetch

## What was implemented in this pass

1. `scripts/api-provider-smoke.ts`
   - loads `.env.local`
   - supports env alias normalization
   - adds DB connectivity smoke

2. `src/app/api/cards/detail/route.ts`
   - card back can now request live detail data by symbol/card context

3. `src/lib/cards/buildCardDetailData.ts`
   - Naver News live fetch
   - OpenDART live fetch
   - DB-first fallback if present
   - search-entry fallback if live/DB unavailable

4. `src/components/home/StockCardBack.tsx`
   - uses detail API response for news/disclosures
   - shows provider source hint
   - renders `AlertBrowsePanel` inline for A-O alert browsing

5. `src/lib/cards/frontFeedRuntime.ts`
   - builds Korean-only front-card runtime data from Data.go.kr
   - calculates current price, change pct, trading amount, recent-high proximity, volume/amount ratios
   - calculates benchmark-relative strength via KOSPI/KOSDAQ ETF proxies

6. `src/lib/marketData.ts`
   - `mode=fast` now merges:
     - `runtime_output/realtime_signals/frontend/front-feed.json`
     - `runtime_output/realtime_signals/frontend/live-feed.json`
     - lightweight in-memory front runtime cache
   - keeps KR-only front feed in the fast path

7. `src/lib/cards/cardFallbackPolicy.ts`
   - stops classifying seeded runtime cards as fallback if real quantitative front data exists
   - prevents `거래 확인중 / 전고점 확인중 / 지수대비 확인중` from leaking onto real-data cards

## Verified UI behavior

### Front

- KR home card renders
- feed fast mode responds quickly
- sample/live card chart path remains intact
- front card now renders:
  - current price
  - change pct
  - trading amount line
  - previous-high fact
  - benchmark-relative strength fact
  - alert condition row

### Browser automation

Command:

```bash
VERIFY_BASE_URL=http://127.0.0.1:3402 PATH=/home/openq/.local/node-portable/bin:$PATH npm run verify:front-card
```

Observed first-card render text excerpt:

```text
삼성전자
81,200원
+2.1%
거래대금 2,480억 / 전일 대비 120%
반도체 관심 + 가격 회복 구간 + 상승 흐름 강화
거래대금 급증
전고점 299,500
지수대비 +3.3%p
알림 조건
지수대비 강세+같은 흐름 알림
```

Assertions:

- `가격 확인중` not present
- `거래대금 확인중` not present
- `전고점` present
- `지수대비` present
- `알림 조건` present

### Back

- actual Naver News items render when available
- actual OpenDART filings render when corp code is available
- direct DART receipt link is used
- `알람 둘러보기` section is visible
- diagnosis/external-link sections remain visible

## Smoke Results

```text
[PASS] GET / 44ms
[PASS] GET /alerts 53ms
[PASS] GET /api/cards/feed?mode=fast 8ms count=5
[PASS] GET /api/live-signals 57ms count=1
[PASS] GET /api/live-alert-triggers 45ms count=1
[PASS] GET /api/cron/live-runtime-sync 49ms mode=fallback
[PASS] condition-alerts CRUD fallback 71ms
[PASS] fixture live-alert-triggers count=1
```

## Limits of this phase

- DB-backed NewsMention persistence is not locally proven without `DATABASE_URL`
- KIS minute-bar runtime is still a worker concern
- Kiwoom token and downstream sample reads now return normal responses, but meaningful investor/short data is still empty in this environment
- KRX direct API remains blocked until API IDs are available
