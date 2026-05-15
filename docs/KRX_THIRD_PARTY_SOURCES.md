# KRX Alternative / Third-Party Data Source Review

Last updated: 2026-05-14

Goal: direct KRX Open API is blocked because the short-selling/investor-flow API IDs are not configured. This document records the practical replacement candidates for short selling, stock lending, and investor flow data, and the source selected for immediate app rendering.

## Shortlist

| Source | Needed data | Runtime result | App use | Refresh cadence | Decision |
|---|---|---|---|---|---|
| Kiwoom REST API | Short selling trend `ka10014`, stock lending by symbol `ka20068`, investor-by-type flow `ka10059` | Implemented and smoke-tested with Samsung Electronics `005930` | `/api/korea/short-flow`, home feed card, explore flows, provider status | Market hours every 15 minutes; after close hourly; holidays daily | Use first |
| Korea Investment KIS Open API | Domestic stock quote/market endpoints; investor-flow endpoints require additional mapping | Token smoke-tested only | Do not render short/flow labels until endpoint mapping and redistribution terms are confirmed | If approved: market hours every 15 minutes; after close hourly | Candidate |
| 금융위원회_주식대차정보 / 주식대차거래정보 on data.go.kr | Stock lending rank, balance, participant trend | Official public API exists, but license is non-commercial/CCL/Kogl restricted | Do not render raw values in a commercial/public app without rights clearance | Daily or realtime depending on dataset | Research only unless rights are cleared |
| KRX Data System / Data Marketplace | Official KRX statistics including investor trading and short selling menus | Direct KRX API IDs missing; screen/OTP scraping is unstable and not suitable for production | Do not scrape for production | N/A | Source-of-truth/reference only |
| Koscom DataMall / CHECK Expert | Licensed market data, historical data, real-time financial information | Not tested; commercial contract required | Best long-term production redistribution path | Contract-dependent | Long-term |
| FnGuide DataGuide / QuantiWise | Investor trading, lending, ownership, time series, screening data | Not tested; subscription/contract required | Good analyst/vendor path if redistribution terms allow app use | Contract-dependent | Long-term candidate |
| Naver Finance / Daum Finance | Publicly visible investor/short-sale pages may exist | Not used; scraping and redistribution risk | Do not use for production app data | N/A | Reject for now |
| FinanceDataReader / pykrx-style wrappers | Convenience wrappers around public/KRX/Naver sources | Not used; upstream rights and stability are unclear | Use only as research/dev reference | N/A | Reject for production |

## Why Kiwoom Is Selected Now

- It is an authenticated broker REST API with documented OAuth token issuance and TR IDs.
- The current credentials successfully returned Samsung Electronics short selling, stock lending, and investor-flow rows.
- It does not require unofficial screen scraping.
- It can provide an app-level summary card immediately while KRX direct API IDs remain blocked.

## Implemented Kiwoom Mapping

| App label | Kiwoom endpoint | TR ID | Required body | Runtime status |
|---|---|---|---|---|
| 공매도 비중/수량 | `POST /api/dostk/shsa` | `ka10014` | `stk_cd`, `strt_dt`, `end_dt` | Success |
| 대차잔고/증감 | `POST /api/dostk/slb` | `ka20068` | `stk_cd` | Success |
| 개인/외국인/기관 수급 | `POST /api/dostk/stkinfo` | `ka10059` | `stk_cd`, `dt`, `amt_qty_tp`, `trde_tp`, `unit_tp` | Success |

## Runtime Test Result

Local smoke test on 2026-05-14:

- Token issue: success.
- `ka10014`: returned `shrts_trnsn` rows for `005930`.
- `ka20068`: returned `dbrt_trde_trnsn` rows for `005930`.
- `ka10059`: returned `stk_invsr_orgn` rows for `005930`.
- App route: `GET /api/korea/short-flow?symbol=005930`.
- App rendering: `/api/cards/feed` returned 8 live cards, including `삼성전자 공매도·수급`.
- Explore rendering: `/api/explore/flows` returned the Kiwoom short/flow card.

## Current App Output

`GET /api/korea/short-flow?symbol=005930` returns:

- latest short selling summary
- latest lending summary
- latest investor-flow summary
- full provider rows in `items[0]`
- source: `kiwoom-rest`
- basis: `일별 기준 · Kiwoom REST API`
- refresh cadence: `장중 15분, 장마감 후 1시간, 휴장일 1일 1회 권장`

## Legal / Product Notes

- Kiwoom REST is a broker API. For personal/internal use it is technically callable with the user's credentials and registered IP.
- For a third-party public app, confirm Kiwoom and exchange redistribution terms before broad commercial release.
- The app currently exposes labels and summaries, not token values, account balances, orders, or raw credential data.
- data.go.kr stock lending datasets are useful technically, but public pages state non-commercial and/or no-derivative license restrictions for the stock-lending datasets. Do not use those raw values in a commercial/public app unless rights are cleared.
- If Kiwoom denies redistribution or throttles production traffic, switch the production path to Koscom/KRX licensed data or a contracted vendor such as FnGuide.

## References

- Kiwoom REST API guide: https://openapi.kiwoom.com/m/guide/apiguide
- 금융위원회_주식대차정보: https://www.data.go.kr/data/15059612/openapi.do
- 금융위원회_주식대차거래정보: https://www.data.go.kr/data/15124865/openapi.do
- Koscom financial information services: https://english.koscom.co.kr/service/finance/info/index.jsp
- FnGuide services/DataGuide overview: https://www.fnguide.com/
