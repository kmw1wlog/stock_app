# Production Release Handoff

## Current Web Release

- app: `stock_app`
- branch: `main`
- commit: `57b584f`
- Production URL: `https://stock-app-mu-three.vercel.app/`
- smoke: `pass`

## Current Native Wrapper Release

- app: `phone_stock_app`
- commit: `601060c`
- applicationId: `com.kmw1wlog.phonestockapp`
- app label: `급등주 for you`
- versionName: `0.1.1`
- versionCode: `2`
- release artifact: `phone-stock-app-release-aab`

## What Changes Require Only Web Deploy

- home card UI copy or layout
- alerts page UI
- API responses and fallback behavior
- card front/back behavior inside the web app
- Vercel-hosted assets and content

These changes flow through the Production URL and do not require rebuilding the Android wrapper.

## What Changes Require A New AAB

- app name
- app icon
- Android permissions
- Capacitor config
- application signing
- native navigation or WebView settings

These changes require a new `phone_stock_app` release build and a higher `versionCode`.
