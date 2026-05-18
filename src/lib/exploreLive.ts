import 'server-only';

import { envelope, getDisplayCards, sortCards } from '@/lib/marketData';
import type { DisplayCard } from '@/lib/marketDataTypes';

export type ExploreSlug = 'movers' | 'amount' | 'themes' | 'news' | 'flows' | 'pullback' | 'after-hours' | 'maps';

export const exploreMeta: Record<ExploreSlug, { title: string; basis: string; sortOptions: string[]; source: string }> = {
  movers: {
    title: '급상승',
    basis: '국장 전일대비 상승률 기준',
    sortOptions: ['상승률', '최신 데이터', '시장별'],
    source: 'db/provider',
  },
  amount: {
    title: '거래대금',
    basis: '거래대금 내림차순 기준',
    sortOptions: ['거래대금', '거래량', '시장별'],
    source: 'db/provider',
  },
  themes: {
    title: '테마',
    basis: '종목 theme과 뉴스/공시 metadata 기준',
    sortOptions: ['종목 수', '뉴스·공시', '최신 데이터'],
    source: 'db/provider',
  },
  news: {
    title: '뉴스·공시',
    basis: 'Naver 뉴스/OpenDART 제목·링크 기준',
    sortOptions: ['최신순', '공시 우선', '시장별'],
    source: 'naver-news/opendart/sec-edgar',
  },
  flows: {
    title: '기관외인매집',
    basis: 'KRX/KIS/Kiwoom provider 기준 · 데이터가 없으면 자료 준비중',
    sortOptions: ['기관', '외국인', '자료 상태'],
    source: 'kr-flow',
  },
  pullback: {
    title: '눌림목/차트자리',
    basis: '가격 하락률과 차트자리 라벨 기준',
    sortOptions: ['하락률', '거래대금', '차트자리'],
    source: 'db/provider',
  },
  'after-hours': {
    title: '시간외',
    basis: '시간외 provider 연동 상태 · 데이터가 없으면 자료 준비중',
    sortOptions: ['자료 상태', '공시', '뉴스'],
    source: 'provider',
  },
  maps: {
    title: '시장지도',
    basis: '국장 테마/업종 metadata 기준',
    sortOptions: ['업종', '테마', '거래대금'],
    source: 'kr-theme/db',
  },
};

function hasNewsOrDisclosure(card: DisplayCard) {
  return (
    card.source.includes('naver') ||
    card.source.includes('sec') ||
    card.source.includes('dart') ||
    card.cardType.includes('disclosure') ||
    card.labels.some((label) => label.includes('뉴스') || label.includes('공시') || label.includes('SEC'))
  );
}

function hasFlowLabel(card: DisplayCard) {
  return card.cardType.includes('flow') || card.labels.some((label) => label.includes('수급') || label.includes('기관') || label.includes('외인') || label.includes('공매도'));
}

function filterCards(slug: ExploreSlug, cards: DisplayCard[]) {
  const krCards = cards.filter((card) => card.market === 'KR');
  switch (slug) {
    case 'movers':
      return sortCards(krCards, 'gainer').slice(0, 20);
    case 'amount':
      return sortCards(krCards, 'amount').slice(0, 20);
    case 'themes':
      return krCards.filter((card) => card.theme).slice(0, 20);
    case 'news':
      return krCards.filter(hasNewsOrDisclosure).slice(0, 20);
    case 'flows':
      return krCards.filter(hasFlowLabel).slice(0, 20);
    case 'pullback':
      return sortCards(krCards.filter((card) => (card.changePct ?? 0) < 0 || card.labels.some((label) => label.includes('차트자리'))), 'loser').slice(0, 20);
    case 'after-hours':
      return krCards.filter((card) => card.labels.some((label) => label.includes('시간외'))).slice(0, 20);
    case 'maps':
      return krCards.filter((card) => card.theme || card.labels.some((label) => label.includes('테마') || label.includes('업종'))).slice(0, 20);
  }
}

export async function getExplorePayload(slug: ExploreSlug) {
  const meta = exploreMeta[slug];
  const items = filterCards(slug, await getDisplayCards(120));
  return envelope(items, meta.source, meta.basis, { message: items.length ? undefined : '데이터 준비중' });
}
