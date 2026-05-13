import { stockCards, type StockCard } from '@/data/mockStocks';

export type RankingCategory = {
  key: string;
  title: string;
  description: string;
  premiumTitle: string;
  cards: StockCard[];
};

export function getRankingCategories(): RankingCategory[] {
  return [
    {
      key: 'save-spike',
      title: '저장 급증 TOP',
      description: '저장 후 다시 확인된 카드 TOP',
      premiumTitle: '저장 급증 TOP 30 전체 보기',
      cards: stockCards.filter((card) => card.fomoType === 'save_spike' || card.saveTrend === '급증'),
    },
    {
      key: 'formula',
      title: '조건식 확인 TOP',
      description: '조건식까지 확인한 사용자가 늘어난 카드',
      premiumTitle: '조건식 확인 랭킹 전체 보기',
      cards: stockCards.filter((card) => card.fomoType === 'formula_copy'),
    },
    {
      key: 'chart-setup',
      title: '차트자리 재등장 TOP',
      description: '같은 차트자리에서 다시 포착된 종목',
      premiumTitle: '같은 차트자리 종목 더 보기',
      cards: stockCards.filter((card) => card.tags.includes('차트자리')),
    },
    {
      key: 'missed',
      title: '놓친 급등 TOP',
      description: '어제 넘긴 뒤 다시 움직인 카드',
      premiumTitle: '놓친 급등 카드 전체 보기',
      cards: stockCards.filter((card) => card.fomoType === 'missed_profit' || card.tags.includes('놓친 카드')),
    },
    {
      key: 'pre-open',
      title: '장전 관심 TOP',
      description: '장전 후보 알림으로 다시 볼 카드',
      premiumTitle: '장전 후보 알림 받기',
      cards: stockCards.filter((card) => card.tags.includes('프리마켓') || card.marketType === 'US'),
    },
    {
      key: 'after-hours',
      title: '시간외 반응 TOP',
      description: '시간외 재등장 신호가 있는 카드',
      premiumTitle: '시간외 재등장 전체 보기',
      cards: stockCards.filter((card) => card.tags.includes('시간외') || card.fomoType === 'after_hours'),
    },
    {
      key: 'us-events',
      title: '미장 이벤트 TOP',
      description: 'SEC·실적 이벤트 이후 관심이 증가한 카드',
      premiumTitle: '미장 이벤트 TOP 30',
      cards: stockCards.filter((card) => card.marketType === 'US'),
    },
    {
      key: 'crypto-leverage',
      title: '코인 레버리지 관심 TOP',
      description: '레버리지와 거래량 유입이 같이 잡힌 카드',
      premiumTitle: '코인 레버리지 랭킹 전체 보기',
      cards: stockCards.filter((card) => card.marketType === 'CRYPTO'),
    },
  ].map((category) => ({
    ...category,
    cards: category.cards.length ? category.cards : stockCards.slice(0, 3),
  }));
}
