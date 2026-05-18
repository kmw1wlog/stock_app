# Data Environment Matrix

실제 key 값은 이 문서에 쓰지 않는다. env 이름과 역할만 정리한다.

## Vercel Production

필수:

- `DATA_MODE=live`
- `NEXT_PUBLIC_ALLOW_MOCK_DATA=false`
- `DATABASE_URL`
- `CRON_SECRET`
- `DATA_GO_KR_SERVICE_KEY`
- `NAVER_CLIENT_ID`
- `NAVER_CLIENT_SECRET`
- `OPENDART_API_KEY`

선택:

- `KRX_OPENAPI_AUTH_KEY`
- `KRX_SHORT_SELLING_API_ID`
- `KRX_INVESTOR_FLOW_API_ID`
- `KIWOOM_REST_API_KEY`
- `KIWOOM_REST_API_SECRET`
- `KIWOOM_API_BASE_URL`
- `NEXT_PUBLIC_ENABLE_TRADINGVIEW_WIDGETS=true`
- `NEXT_PUBLIC_ENABLE_COINGECKO_WIDGETS=false`
- `NEXT_PUBLIC_ENABLE_CMC_WIDGETS=false`

주의:

- `KIS_APP_KEY`, `KIS_APP_SECRET`는 Vercel 상주 loop 용도가 아니다.
- KIS worker는 별도 서버에 둔다.
- secret은 절대 `NEXT_PUBLIC_*`로 두지 않는다.

## Worker

필수:

- `DATABASE_URL`
- `KIS_ENV`
- `KIS_APP_KEY`
- `KIS_APP_SECRET`
- `KIS_BASE_URL`
- `KIS_MINUTE_ENDPOINT`
- `KIS_MINUTE_TR_ID`
- `KIS_MARKET_DIV_CODE`
- `POLL_SECONDS`
- `LOOKBACK_MINUTES`
- `OUTPUT_DIR`

선택:

- `NAVER_CLIENT_ID`
- `NAVER_CLIENT_SECRET`
- `OPENDART_API_KEY`

## Local

권장:

- `.env.local` 사용
- `.env.local`은 커밋 금지
- `DATA_MODE=live`
- `NEXT_PUBLIC_ALLOW_MOCK_DATA=false`

alias 허용:

- `KIS_APP_KEY` → smoke script에서 `KIS_API_KEY` alias 허용
- `KIS_APP_SECRET` → smoke script에서 `KIS_API_SECRET` alias 허용
- `KIWOOM_APP_KEY` → `KIWOOM_REST_API_KEY` alias 허용
- `KIWOOM_SECRET_KEY` → `KIWOOM_REST_API_SECRET` alias 허용
- `DATA_GO_KR_SERVICE_KEY` → `DATA_GO_KR_PRODUCT_SERVICE_KEY` fallback 허용

## 보안 원칙

- API key, broker secret, DB secret을 git에 커밋하지 않는다.
- APK/AAB에 provider key를 넣지 않는다.
- `NEXT_PUBLIC_*`에는 UI toggle만 둔다.
- 이미 외부에 노출된 key가 있다면 회전이 필요하다.
