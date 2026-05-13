# Implementation Status

Last updated: 2026-05-14

| Area | Status | Notes |
|---|---|---|
| Versioning | 구현됨 | `package.json` 0.4.0, `src/lib/version.ts` 추가 |
| DATA_MODE policy | 구현됨 | live 모드에서는 mock 카드를 반환하지 않음 |
| Home feed | 구현됨 | `/api/cards/feed` 기반. 데이터 없으면 준비중 |
| Explore | 구현됨 | 더보기 라우트와 API가 DB 우선, 없으면 준비중 |
| Rankings | 구현됨 | 사용자 행동 랭킹 대신 가격/거래대금/뉴스/공시/코인 기준 |
| Report | 구현됨 | 시장 데이터 리포트로 재구성 |
| Saved | 부분 구현 | localStorage 저장 종목에 대해 현재 feed 데이터 매칭 |
| KR EOD pipeline | 부분 구현 | Asset 전체 순회 구조 구현. Data.go.kr 키와 실제 응답 검증 필요 |
| OpenDART pipeline | 부분 구현 | `dartCorpCode` 있는 KR 자산 순회. corpCode 없는 자산은 skip |
| Naver News pipeline | 부분 구현 | 제목/링크 저장. 본문 재게시 없음 |
| US SEC pipeline | 부분 구현 | CIK 있는 US 자산 순회 |
| US direct price | 실패/보류 | 직접 가격 API 키 없으면 비활성. TradingView 위젯 사용 |
| Crypto Binance/Upbit | 부분 구현 | public API provider와 저장 구조 구현. 운영 네트워크에서 실행 검증 필요 |
| KRX short/flow | 부분 구현 | provider interface/env 기반. API ID와 권한 확정 필요 |
| PWA | 부분 구현 | manifest와 기본 SVG 아이콘 추가. 스토어 래핑은 미구현 |
| Premium/ads UI | 비활성화 | 화면에서 제거 |

