# Store Deploy Checklist

This version targets Vercel/PWA deployment. Play Store/App Store native wrapping is not included.

## Required Env

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_APP_URL`
- `CRON_SECRET`
- `DATA_MODE=live`
- `NEXT_PUBLIC_ALLOW_MOCK_DATA=false`

## Provider Env

- KR: `DATA_GO_KR_SERVICE_KEY`, `OPENDART_API_KEY`, `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`
- US: `SEC_USER_AGENT=StockApp/0.5.0 contact@example.com`, `NEXT_PUBLIC_ENABLE_TRADINGVIEW_WIDGETS=true`
- Optional US direct price: `US_DIRECT_PRICE_PROVIDER=alpaca|fmp|alphaVantage|twelveData`, selected provider key
- Optional US/global news: `MARKETAUX_API_TOKEN`
- Crypto widgets: `NEXT_PUBLIC_ENABLE_COINGECKO_WIDGETS=true`, `NEXT_PUBLIC_ENABLE_CMC_WIDGETS=false`
- Optional KRX: `KRX_OPENAPI_AUTH_KEY`, `KRX_SHORT_SELLING_API_ID`, `KRX_INVESTOR_FLOW_API_ID`

## Deployment Steps

1. Set Vercel env values.
2. Run `npm run prisma:generate`.
3. Apply DB migration for `DataProviderStatus` and existing schema changes.
4. Run `npx prisma db seed`.
5. Run `POST /api/admin/refresh-all` with `Authorization: Bearer CRON_SECRET`.
6. Check `GET /api/provider-status`.
7. Check `/data-status`.
8. Check `GET /api/cards/feed`.
9. Check `GET /api/rankings`.
10. Check `GET /api/report`.
11. Check `GET /api/assets/[assetKey]/candles` for KR/crypto assets with saved candles.
12. Verify home renders live data cards or honest empty states.
13. Verify no production UI copy contains premium/user/FOMO banned text.
14. Verify PWA manifest and icons.

## Local Verification Completed

- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm run prisma:validate`: passed.
- `npm run prisma:generate`: passed.
- `npm run data:smoke`: passed with Binance, Upbit, Alternative Fear & Greed.
- `npm run check:banned-copy`: passed.
- `npm run data:verify-render`: passed against `http://localhost:3000`.
- `npm run test:ui`: passed.
- `npm run api:smoke`: passed with 16 successful API groups and 1 blocked KRX API-ID group.

## Native Store Wrapping

TWA/Capacitor wrapping is not implemented in v0.5.0. The next step is to wrap the deployed PWA URL after live data provider status is stable in production.
