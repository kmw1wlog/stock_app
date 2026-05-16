# Vercel Deploy

This document is for the `stock_app` Vercel Hobby deployment whose only goal is to obtain a stable HTTPS URL for the APK wrapper.

## Scope

- include:
  - Next.js app build
  - home page
  - alerts page
  - fallback/mock card feed
  - condition-alerts fallback API
- exclude:
  - KIS realtime worker
  - 30-minute collection jobs
  - long-running loops
  - Vercel Cron
  - DB-backed live ingestion

`vercel.json` intentionally contains no `crons`.

## Local Build Gate

Before trying Vercel deploy, verify:

```bash
npm install
npm run typecheck
npm run build
```

Important:

- `next@16` requires Node `>=20.9.0`
- if your local shell still resolves to Node `18`, switch to Node `20+` first
- one working local example in this repo is:

```bash
PATH=$HOME/.local/node-portable/bin:$PATH npm run build
```

## Minimum Env For Hobby Deploy

Strictly required for fallback deployment:

- none

Recommended for predictable fallback/mock behavior:

- `DATA_MODE=mock`
- `NEXT_PUBLIC_ALLOW_MOCK_DATA=true`

Optional UI-only toggles:

- `NEXT_PUBLIC_ENABLE_TRADINGVIEW_WIDGETS=false`
- `NEXT_PUBLIC_ENABLE_COINGECKO_WIDGETS=false`
- `NEXT_PUBLIC_ENABLE_CMC_WIDGETS=false`

Not required for this deploy:

- `DATABASE_URL`
- `DIRECT_URL`
- `CRON_SECRET`
- provider API keys
- KIS / Kiwoom / broker credentials

## Secrets That Must Not Be Public

Do not put any broker or trading secret into client-exposed env.

Never use:

- `NEXT_PUBLIC_KIS_APP_KEY`
- `NEXT_PUBLIC_KIS_APP_SECRET`
- `NEXT_PUBLIC_KIS_ACCOUNT_NO`

Keep these server-only if they are ever used later on a worker server:

- `KIS_APP_KEY`
- `KIS_APP_SECRET`
- `KIS_ACCOUNT_NO`

The same rule applies to Kiwoom or any other broker secret.

## Vercel Project Settings

1. Import `kmw1wlog/stock_app`.
2. Keep Framework Preset as `Next.js`.
3. Use the default install command:

```bash
npm install
```

4. Use the default build command:

```bash
npm run build
```

5. Ensure the project Node version is `20` or higher.

If Vercel exposes a Node version selector, choose Node `22`.

## Expected Behavior In Fallback Deploy

With no DB and no provider secrets:

- `/` should render the shell and fallback/home cards
- `/alerts` should render the shell and fallback alert state
- `/api/cards/feed?mode=fast` should return `ok: true`
- `/api/live-alert-triggers` should return `ok: true`
- `/api/condition-alerts` should work in fallback mode

## Manual Verification After Deploy

1. Open the Vercel HTTPS URL.
2. Check `/`.
3. Check `/alerts`.
4. Check `/api/cards/feed?mode=fast`.
5. Check `/api/live-alert-triggers`.
6. Create one condition alert from the UI if possible.
7. Confirm no page crashes because of missing DB or missing broker keys.

## Promotion Rule

Use the Vercel URL for the APK wrapper only after:

- Vercel build succeeds
- the deployed HTTPS URL opens on mobile
- `/` and `/alerts` render normally
- fallback API routes return `ok: true`
