import 'server-only';

import { envelope, getDisplayCards, sortCards } from '@/lib/marketData';
import type { DisplayCard } from '@/lib/marketDataTypes';

export type ExploreSlug = 'movers' | 'themes' | 'news' | 'flows' | 'pullback' | 'after-hours' | 'maps';

export const exploreMeta: Record<ExploreSlug, { title: string; basis: string; sortOptions: string[]; source: string }> = {
  movers: {
    title: '실시간 급등 / 상승예상 / 상한가',
    basis: '국장 전일 기준 · 코인 24h 기준 · 미장은 TradingView/SEC 기준',
    sortOptions: ['등락률', '거래대금', '최신 데이터'],
    source: 'db/provider',
  },
  themes: {
    title: '인기테마',
    basis: 'Asset theme와 뉴스/공시 metadata 기준',
    sortOptions: ['종목 수', '뉴스/공시', '최신 데이터'],
    source: 'db/provider',
  },
  news: {
    title: '속보뉴스 / 실시간 이슈',
    basis: 'Naver 뉴스/OpenDART/SEC EDGAR 제목·링크 기준',
    sortOptions: ['최신순', '공시 우선', '시장별'],
    source: 'naver-news/opendart/sec-edgar',
  },
  flows: {
    title: '기관외인매집',
    basis: 'KRX/KIS provider 준비중 · 데이터 없으면 자료 준비중',
    sortOptions: ['기관', '외국인', '자료 상태'],
    source: 'krx',
  },
  pullback: {
    title: '하락종목 / 눌림목 후보',
    basis: '가격 하락률과 차트자리 라벨 기준',
    sortOptions: ['하락률', '거래대금', '차트자리'],
    source: 'db/provider',
  },
  'after-hours': {
    title: '시간외 단일가',
    basis: '시간외 provider 미연결 · 자료 준비중',
    sortOptions: ['자료 상태', '공시', '뉴스'],
    source: 'provider',
  },
  maps: {
    title: '500MAP / 섹터맵 / 공포탐욕',
    basis: 'Alternative Fear & Greed 및 저장된 섹터 metadata 기준',
    sortOptions: ['시장', '섹터', '공포탐욕'],
    source: 'alternative-fng/db',
  },
};

function hasNewsOrDisclosure(card: DisplayCard) {
  return card.source.includes('naver') || card.source.includes('sec') || card.source.includes('dart') || card.cardType.includes('disclosure') || card.labels.some((label) => label.includes('뉴스') || label.includes('공시') || label.includes('SEC'));
}

function filterCards(slug: ExploreSlug, cards: DisplayCard[]) {
  switch (slug) {
    case 'movers':
      return sortCards(cards.filter((card) => card.market !== 'US' || card.isWidget), 'gainer').slice(0, 20);
    case 'themes':
      return cards.filter((card) => card.theme).slice(0, 20);
    case 'news':
      return cards.filter(hasNewsOrDisclosure).slice(0, 20);
    case 'flows':
      return cards.filter((card) => card.labels.some((label) => label.includes('수급') || label.includes('기관') || label.includes('외국인'))).slice(0, 20);
    case 'pullback':
      return sortCards(cards.filter((card) => (card.changePct ?? 0) < 0 || card.labels.some((label) => label.includes('차트자리'))), 'loser').slice(0, 20);
    case 'after-hours':
      return [];
    case 'maps':
      return cards.filter((card) => card.market === 'CRYPTO' || card.labels.some((label) => label.includes('공포탐욕'))).slice(0, 20);
  }
}

export async function getExplorePayload(slug: ExploreSlug) {
  const meta = exploreMeta[slug];
  const items = filterCards(slug, await getDisplayCards(120));
  return envelope(items, meta.source, meta.basis, { message: items.length ? undefined : '데이터 준비중' });
}
