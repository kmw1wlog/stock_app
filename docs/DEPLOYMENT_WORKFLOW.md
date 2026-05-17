# Deployment Workflow

This document defines how UI changes in `stock_app` move from a feature branch to Vercel Preview, then to `main`, then to the Production URL used by the Android wrapper.

## Current Production URL

`phone_stock_app` opens this URL:

```text
https://stock-app-mu-three.vercel.app/
```

Important:

- this URL reflects the latest successful `main` deployment only
- feature branch changes do not appear here before merge
- the APK and AAB wrappers open this same Production URL

## Branch To Production Flow

1. Create or update a feature branch.
2. Implement the UI change in `stock_app`.
3. Run local gates before PR:

```bash
npm run typecheck
npm run build
```

4. Push the feature branch.
5. Open a GitHub PR from the feature branch into `main`.
6. Confirm the Vercel Preview deployment for that PR or commit.
7. Review the Preview URL in desktop and mobile Chrome.
8. Merge the PR into `main`.
9. Wait for the Vercel Production deployment for `main` to become `Ready`.
10. Re-check the Production URL.
11. Re-open the installed APK and confirm it now shows the updated web UI.

## What Happens Before Merge

Before a feature branch is merged into `main`:

- `https://stock-app-mu-three.vercel.app/` does not show the new UI
- only the branch Preview deployment should show the new UI
- the installed APK continues to show whatever is on the current Production URL

This is the key rule:

- Preview proves the branch build and UI
- Production changes only after `main` deploys successfully

## How To Find The Vercel Preview URL

Preferred path:

1. Open the GitHub PR.
2. Open the checks section.
3. Find the `Vercel` check.
4. Click `Details`.
5. Use the Preview deployment page or Preview URL shown there.

If the PR has not been created yet:

1. Open the branch commit on GitHub.
2. Find the `Vercel` status check on that commit.
3. Click `Details`.

If the Preview domain is not directly visible from local CLI:

- use the GitHub PR checks page
- or use the Vercel deployment page opened from the `Vercel` check

## Production Reflection Rule

The Production URL below updates only when both conditions are true:

```text
https://stock-app-mu-three.vercel.app/
```

Conditions:

1. the PR is merged into `main`
2. the Vercel Production deployment for `main` is `Ready`

If a new `main` deployment fails:

- the older ready Production deployment remains live
- the Production URL may continue to show the previous UI

## What Requires Only stock_app Changes

These changes usually require only `stock_app` work and a successful `main` deploy:

- home feed UI changes
- card layout or copy updates
- chart placeholder changes
- alert modal UI changes
- alert recommendation copy changes
- API response formatting inside the web app
- CSS or component changes in the Next.js app

For these cases:

- no APK rebuild is required
- no new AAB is required
- the installed Android wrapper will load the updated UI after Production is refreshed

## What Requires phone_stock_app Rebuild

These changes require work in `phone_stock_app`, a version bump, and a new APK or AAB:

- app icon changes
- splash screen or launcher branding changes
- WebView settings changes
- Android permissions changes
- `appId` or `applicationId` changes
- native back button behavior changes
- signing configuration changes
- release pipeline changes
- any other Android native setting changes

When `phone_stock_app` changes are made:

1. update the native project
2. increase `versionCode`
3. build a new AAB or APK
4. upload the new artifact to Play Console or install it manually

## Android Verification After Web UI Deploy

After `main` deployment becomes `Ready`:

1. Open the Production URL in desktop Chrome.
2. Open the Production URL in Android Chrome.
3. Force-refresh if needed.
4. Close and re-open the installed APK.
5. Confirm the app now reflects the updated `stock_app` UI.

Because the wrapper loads the Production URL:

- most web-only UI updates should appear without reinstalling the app

## If Old UI Still Appears

Use this order:

1. confirm the PR is merged
2. confirm the Vercel Production deployment is `Ready`
3. refresh the browser tab
4. fully close and re-open the Android app
5. if needed, clear browser or WebView cache through device settings

Common cause:

- the Production deployment is not ready yet
- or the device is still showing a cached web session

## Recommended Release Habit For UI Work

For each UI change:

1. create a feature branch
2. run `npm run typecheck`
3. run `npm run build`
4. push branch
5. review Vercel Preview
6. merge to `main`
7. confirm Vercel Production `Ready`
8. verify on desktop Chrome
9. verify on Android Chrome
10. re-open installed APK and confirm live reflection

## Current Example

Feature branch:

```text
feature/home-feed-card-ui-v1
```

Current branch commit:

```text
4705f08
```

Production URL:

```text
https://stock-app-mu-three.vercel.app/
```

This branch is not reflected on Production until it is merged into `main` and the Vercel Production deployment becomes `Ready`.
