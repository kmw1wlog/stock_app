import { stockCards } from '@/data/mockStocks';

export type ExploreSlug = 'movers' | 'themes' | 'news' | 'flows' | 'pullback' | 'after-hours' | 'maps';

export const exploreConfig: Record<
  ExploreSlug,
  {
    title: string;
    basis: string;
    sortOptions: string[];
    description: string;
  }
> = {
  movers: {
    title: '실시간 급등 / 상승예상 / 상한가',
    basis: '가격·거래대금 라벨 기준 · DB 없으면 mock fallback',
    sortOptions: ['등락률', '거래대금', '저장 증가'],
    description: '오늘 지금 뜨는 급등 후보를 모았습니다.',
  },
  themes: {
    title: '인기테마',
    basis: '카드 테마와 뉴스 키워드 기준 · DB 없으면 mock fallback',
    sortOptions: ['저장 증가', '카드 수', '상세 확인'],
    description: '반도체, 로봇, 바이오, AI 등 관심 테마를 묶어 봅니다.',
  },
  news: {
    title: '속보뉴스 / 실시간 이슈',
    basis: '뉴스 제목/키워드 기준 · 원문 무단 재게시 없음',
    sortOptions: ['최신순', '키워드 증가', '상세 확인'],
    description: '뉴스와 커뮤니티 정보는 제목 일부, 키워드, 링크 중심으로 제공합니다.',
  },
  flows: {
    title: '기관외인매집',
    basis: '수급 라벨 기준 · KRX/KIS provider 준비중이면 fallback',
    sortOptions: ['기관', '외국인', '조건식 확인'],
    description: '수급과 조건식 확인이 같이 붙은 카드를 모았습니다.',
  },
  pullback: {
    title: '하락종목 / 눌림목 후보',
    basis: '차트자리 라벨 기준 · DB 없으면 mock fallback',
    sortOptions: ['차트자리', '거래대금', '위험도'],
    description: '같은 차트자리에서 다시 확인된 후보입니다.',
  },
  'after-hours': {
    title: '시간외 단일가',
    basis: '시간외/장전 후보 라벨 기준 · provider 없으면 fallback',
    sortOptions: ['시간외', '장전', '저장 증가'],
    description: '장전/장후 다시 볼 후보입니다.',
  },
  maps: {
    title: '500MAP / 섹터맵 / 공포탐욕',
    basis: '시장 폭과 섹터 라벨 기준 · fallback',
    sortOptions: ['섹터', '상승 종목 수', '공포탐욕'],
    description: '전체 시장과 섹터 온도를 빠르게 봅니다.',
  },
};

export function getExploreCards(slug: ExploreSlug) {
  switch (slug) {
    case 'movers':
      return stockCards.filter((card) => card.tags.includes('오늘 급등') || card.priceChangeRate >= 8);
    case 'themes':
      return stockCards;
    case 'news':
      return stockCards.filter((card) => card.tags.includes('뉴스') || card.fomoType === 'community_heat');
    case 'flows':
      return stockCards.filter((card) => card.tags.includes('기관외인') || card.diagnosis.leader.includes('기관') || card.diagnosis.leader.includes('외인'));
    case 'pullback':
      return stockCards.filter((card) => card.tags.includes('차트자리') || card.tags.includes('눌림목'));
    case 'after-hours':
      return stockCards.filter((card) => card.tags.includes('시간외') || card.tags.includes('프리마켓') || card.marketType === 'CRYPTO');
    case 'maps':
      return stockCards;
  }
}
