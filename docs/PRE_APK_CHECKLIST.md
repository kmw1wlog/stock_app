# Pre-APK Checklist

## Baseline

- Repository: `kmw1wlog/stock_app`
- Baseline commit: `854afa34ff898c94da0acda7c2d8ab75a1a3bab1`
- Focus after that commit:
  - production build path stability
  - runtime/API smoke before WebView wrapping
  - deployable HTTPS URL validation for `phone_stock_app`

## What Passed Before This Checklist

- `npm run typecheck`
- `python3 -m unittest tests/test_realtime_signal_engine.py tests/test_kis_live_pipeline.py`
- `npm run live:sync`
- `next dev --webpack` with `/api/cards/feed` live response

## Current Build Issue

- `npm run build` can fail in this environment through a Next 16 Turbopack internal panic.
- Earlier reproduction reached about `10.1 GB` max RSS before failure.
- That points to a build-path or bundler/runtime issue, not the realtime Python/runtime regression that was already fixed.

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
3. Test production builds:
   - `npm run build`
   - `NODE_OPTIONS="--max-old-space-size=8192" npm run build`
   - `npm run build:stable`
4. Run local smoke:
   - `next dev --webpack -p 3000`
   - `SMOKE_BASE_URL=http://localhost:3000 npm run smoke:pre-apk`
5. Run deployed smoke:
   - `SMOKE_BASE_URL=https://<real-stock-app-url> npm run smoke:pre-apk`

## Smoke Script

- Script: `scripts/smoke-pre-apk.ts`
- Package command: `npm run smoke:pre-apk`
- Endpoints checked:
  - `GET /`
  - `GET /alerts`
  - `GET /api/cards/feed`
  - `GET /api/live-signals`
  - `GET /api/live-alert-triggers`
  - `GET /api/cron/live-runtime-sync`
  - `POST/GET/PATCH /api/condition-alerts`

Fallback mode is acceptable for condition alerts and live sync as long as the route returns `ok: true`.

## Build Failure Handling

- Do not move to APK wrapping only because `next dev` works locally.
- If `npm run build` fails locally, capture the log and classify it:
  - application code error
  - Next 16 / Turbopack environment issue
  - unresolved / unknown
- If the failure is local-environment-specific but Vercel or CI production build passes and the deployed HTTPS smoke passes, APK wrapping can proceed.
- If there is no working production build path and no verified HTTPS URL, do not move to APK wrapping.

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
- `/api/cards/feed` fails
- `/api/live-alert-triggers` fails
- condition-alerts smoke fails
- no deployable HTTPS URL exists
