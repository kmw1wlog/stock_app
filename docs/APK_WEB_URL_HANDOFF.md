# APK Web URL Handoff

## Production URL

Use this exact URL for `phone_stock_app`:

```text
https://stock-app-mu-three.vercel.app/
```

## Why This URL

- this is the Vercel Production alias
- new successful `main` deployments continue to point this URL at the latest production app
- if a later deployment fails, the previous ready production deployment remains available

Do not use:

- branch URLs
- preview URLs
- deployment-specific immutable URLs

## Current Known-Good Deployment

- status: `Ready`
- environment: `Production`
- branch: `main`
- commit: `57b584f`
- commit message: `Merge PR #8: Finalize Korean-only home card UI for Play testing`

## Expected Fallback Env On Vercel

- `DATA_MODE=mock`
- `NEXT_PUBLIC_ALLOW_MOCK_DATA=true`

Optional:

- `NEXT_PUBLIC_ENABLE_TRADINGVIEW_WIDGETS=false`
- `NEXT_PUBLIC_ENABLE_COINGECKO_WIDGETS=false`
- `NEXT_PUBLIC_ENABLE_CMC_WIDGETS=false`

Do not add for the APK-wrapper URL stage:

- `DATABASE_URL`
- `DIRECT_URL`
- `CRON_SECRET`
- provider API keys
- KIS credentials
- Kiwoom credentials

## Secrets Policy

Never expose these as `NEXT_PUBLIC_*`:

- `KIS_APP_KEY`
- `KIS_APP_SECRET`
- `KIS_ACCOUNT_NO`
- `KIWOOM_*`

## Remote Smoke Command

```powershell
$env:SMOKE_BASE_URL = "https://stock-app-mu-three.vercel.app/"
$env:SMOKE_REQUIRE_LIVE_TRIGGER = "false"
npm run smoke:pre-apk
Remove-Item Env:\SMOKE_BASE_URL
Remove-Item Env:\SMOKE_REQUIRE_LIVE_TRIGGER
```

Expected:

- `/` pass
- `/alerts` pass
- `/api/cards/feed?mode=fast` pass
- `/api/live-signals` pass
- `/api/live-alert-triggers` pass
- `/api/cron/live-runtime-sync` pass
- `condition-alerts CRUD` pass

## Update Policy

- `stock_app` UI or API changes are reflected by updating this Production URL.
- `phone_stock_app` does not need a new APK or AAB when only the web app changes.
- `phone_stock_app` does need a new AAB when native settings change, such as app name, icon, permissions, signing, or Capacitor/Android configuration.
