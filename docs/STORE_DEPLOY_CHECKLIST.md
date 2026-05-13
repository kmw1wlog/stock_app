# Store Deploy Checklist

## Vercel 배포

- `DATABASE_URL` 설정
- `DIRECT_URL` 설정
- `NEXT_PUBLIC_APP_URL` 설정
- `CRON_SECRET` 설정
- `DATA_MODE=live` 설정
- `NEXT_PUBLIC_ALLOW_MOCK_DATA=false` 설정

## 데이터 env

- 국장: `DATA_GO_KR_SERVICE_KEY`, `OPENDART_API_KEY`, `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`
- 미장: `SEC_USER_AGENT`, `NEXT_PUBLIC_ENABLE_TRADINGVIEW_WIDGETS=true`
- 코인: `NEXT_PUBLIC_ENABLE_COINGECKO_WIDGETS=true`
- 선택: KRX, Twelve Data, Polygon, Alpaca 관련 env

## 배포 전 절차

1. `npm run prisma:validate`
2. `npm run prisma:generate`
3. `npx prisma migrate dev` 또는 운영 migration 적용
4. `npx prisma db seed`
5. `POST /api/admin/refresh-all` 실행
6. `/api/provider-status` 확인
7. `/data-status` 확인
8. `/api/cards/feed`, `/api/rankings`, `/api/report` 응답 확인
9. 홈/탐색/랭킹/보관함/리포트 화면에서 임의 가격/임의 차트가 보이지 않는지 확인
10. PWA manifest 확인

## 스토어 래핑

Play Store TWA 또는 Capacitor 래핑은 이번 버전에서 구현하지 않았습니다. 우선 Vercel 배포 가능한 PWA 상태를 목표로 합니다.

