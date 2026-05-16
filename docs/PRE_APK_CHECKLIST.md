# Pre-APK Checklist

## Baseline

- Repository: `kmw1wlog/stock_app`
- Baseline commit: `854afa34ff898c94da0acda7c2d8ab75a1a3bab1`
- Follow-up commit: `d0fe43dc7704732cbe1608b3a828fd8fd3a5618e`
- Focus after that commit:
  - home/alerts shell-first rendering
  - production build path stability
  - runtime/API smoke before WebView wrapping
  - deployable HTTPS URL validation for `phone_stock_app`

## Current Status

- `npm run typecheck`
- `python3 -m unittest tests/test_realtime_signal_engine.py tests/test_kis_live_pipeline.py`
- `npm run live:sync`
- `npm run seed:test-alert`
- `PATH=$HOME/.local/node-portable/bin:$PATH npm run build`
- `PATH=$HOME/.local/node-portable/bin:$PATH NODE_OPTIONS="--max-old-space-size=8192" npm run build`
- `PATH=$HOME/.local/node-portable/bin:$PATH npm run build:stable`
- `PATH=$HOME/.local/node-portable/bin:$PATH npm exec -- next dev --webpack -p 3000`
- `SMOKE_BASE_URL=http://localhost:3000 SMOKE_WARMUP=true npm run smoke:pre-apk`

## Structural Changes Applied

1. `/` is shell-first now.
   - `src/app/page.tsx` no longer awaits `getDisplayCards`.
   - `HomePageClient` fetches `/api/cards/feed?mode=fast` after mount.
2. `/alerts` is shell-first now.
   - `src/app/alerts/page.tsx` no longer awaits live triggers.
   - `AlertsPageClient` keeps the page shell visible while it fetches triggers and saved alerts.
3. `/api/cards/feed?mode=fast` avoids slow provider paths.
   - fast mode reads runtime JSON, DB-backed cards, yfinance JSON, and default watchlists only.
4. alert smoke is market-hour independent now.
   - `scripts/seed-test-live-alert.ts` writes deterministic runtime fixtures.
5. Tailwind source scanning is restricted to `src`.
   - `src/app/globals.css` uses `@import "tailwindcss" source(none);` and `@source "..";`
   - This keeps Tailwind away from repo-root payloads such as `kor_feed_engine_inventory_20260515/`.

## Prior Build Failure Summary

- Earlier reproductions failed in Next 16 through:
  - Turbopack panic on `/page`
  - webpack `SIGKILL`
  - max RSS around `10 GB`
- The main contributing factor was broad source/build context pressure combined with a very large repo root.
- After limiting Tailwind source detection to `src` and splitting the home feed into a deferred client chunk, the production build path recovered in this environment.

## Required Checks Before APK Wrapping

1. Confirm runtime outbox exists:
   - `runtime_output/realtime_signals/formula_signals_latest.json`
   - `runtime_output/realtime_signals/alert_triggers_latest.json`
   - `runtime_output/realtime_signals/frontend/live-feed.json`
   - `runtime_output/realtime_signals/frontend/live-alert-triggers.json`
2. Run:
   - `rm -rf .next`
   - `npm install`
   - `npm run typecheck`
   - `python3 -m unittest tests/test_realtime_signal_engine.py tests/test_kis_live_pipeline.py`
   - `npm run live:sync`
   - `npm run seed:test-alert`
3. Test production builds:
   - `PATH=$HOME/.local/node-portable/bin:$PATH npm run build`
   - `PATH=$HOME/.local/node-portable/bin:$PATH NODE_OPTIONS="--max-old-space-size=8192" npm run build`
   - `PATH=$HOME/.local/node-portable/bin:$PATH npm run build:stable`
4. Run local smoke:
   - `PATH=$HOME/.local/node-portable/bin:$PATH npm exec -- next dev --webpack -p 3000`
   - `SMOKE_BASE_URL=http://localhost:3000 SMOKE_WARMUP=true npm run smoke:pre-apk`
5. Run deployed smoke:
   - `SMOKE_BASE_URL=https://<real-stock-app-url> npm run smoke:pre-apk`

## Smoke Script

- Script: `scripts/smoke-pre-apk.ts`
- Package command: `npm run smoke:pre-apk`
- Related fixture command: `npm run seed:test-alert`
- Warm-up:
  - `GET /`
  - `GET /alerts`
  - `GET /api/cards/feed?mode=fast`
- Endpoints checked:
  - `GET /`
  - `GET /alerts`
  - `GET /api/cards/feed?mode=fast`
  - `GET /api/live-signals`
  - `GET /api/live-alert-triggers`
  - `GET /api/cron/live-runtime-sync`
  - `POST/GET/PATCH /api/condition-alerts`
- Local fixture verification:
  - seed runtime JSON
  - verify `GET /api/live-alert-triggers` returns `count >= 1`

Fallback mode is acceptable for condition alerts and live sync as long as the route returns `ok: true`.

## Build Failure Handling

- Do not move to APK wrapping only because `next dev` works locally.
- If `npm run build` fails locally, capture the log and classify it:
  - application code error
  - Next 16 / Turbopack environment issue
  - unresolved / unknown
- If the failure is local-environment-specific but Vercel or CI production build passes and the deployed HTTPS smoke passes, APK wrapping can proceed.
- If there is no working production build path and no verified HTTPS URL, do not move to APK wrapping.
- If local `node -v` is still `18.x`, use a Node `>=20.9.0` runtime for Next 16 commands before treating the build as failed.

## HTTPS URL Requirement

`phone_stock_app` must open a real HTTPS app URL in Android WebView. Valid examples:

- Vercel production URL
- Vercel preview URL
- Render / Railway URL
- HTTPS EC2 URL
- Cloudflare Tunnel / ngrok HTTPS URL

The URL is only acceptable after `npm run smoke:pre-apk` passes against that URL.

## Manual Mobile Browser Check

Open the HTTPS URL in Android Chrome and verify:

1. `/` loads within about 5 seconds.
2. `/alerts` loads within about 5 seconds.
3. cards are visible.
4. detail navigation works.
5. save and condition-alert actions do not error.
6. `/alerts` shows expected alert state.
7. scroll / back / bottom navigation are usable.
8. no clipping under status bar or bottom inset.
9. external links do not freeze the app.
10. policy / caution pages remain reachable.

## Decision Rule

APK wrapping may proceed only when one of these is true:

- local production build succeeds and deployed HTTPS smoke succeeds
- local build fails only because of a verified environment-specific Next/Turbopack issue, but CI/Vercel production build succeeds and deployed HTTPS smoke succeeds

APK wrapping must stop when any of these remain true:

- `/` exceeds 5 seconds or times out
- `/alerts` exceeds 5 seconds or times out
- `/api/cards/feed?mode=fast` fails
- `/api/live-alert-triggers` fails
- condition-alerts smoke fails
- no deployable HTTPS URL exists
