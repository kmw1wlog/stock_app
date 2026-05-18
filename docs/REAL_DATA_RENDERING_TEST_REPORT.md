# Real Data Rendering Test Report

## Environment

- Date: 2026-05-18
- Branch: `feature/home-feed-card-ui-v1`
- App URL under local verification: `http://127.0.0.1:3401`
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

## Verified UI behavior

### Front

- KR home card renders
- feed fast mode responds quickly
- sample/live card chart path remains intact

### Back

- actual Naver News items render when available
- actual OpenDART filings render when corp code is available
- direct DART receipt link is used
- `알람 둘러보기` section is visible
- diagnosis/external-link sections remain visible

## Smoke Results

```text
[PASS] GET / 52ms
[PASS] GET /alerts 75ms
[PASS] GET /api/cards/feed?mode=fast 13ms count=9
[PASS] GET /api/live-signals 165ms count=0
[PASS] GET /api/live-alert-triggers 106ms count=0
[PASS] GET /api/cron/live-runtime-sync 118ms mode=fallback
[PASS] condition-alerts CRUD fallback 142ms
[PASS] fixture live-alert-triggers count=1
```

## Limits of this phase

- DB-backed NewsMention persistence is not locally proven without `DATABASE_URL`
- KIS minute-bar runtime is still a worker concern
- Kiwoom downstream read TRs remain blocked despite token issuance
- KRX direct API remains blocked until API IDs are available
