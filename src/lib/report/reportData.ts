import { resultByCardId } from '@/data/mockResults';
import { stockCards } from '@/data/mockStocks';

export function getReportData() {
  const viewedCards = stockCards.slice(0, 5);
  const savedCards = stockCards.filter((card) => ['rainbow-robotics', 'isupetasys', 'alteogen'].includes(card.id));
  const missedCards = stockCards.filter((card) => card.fomoType === 'missed_profit' || card.tags.includes('놓친 카드'));
  const chartSetups = Array.from(new Set(stockCards.map((card) => card.chartSetupType))).slice(0, 5);
  const themeCounts = stockCards.reduce<Record<string, number>>((acc, card) => {
    acc[card.theme] = (acc[card.theme] ?? 0) + 1;
    return acc;
  }, {});
  const marketCounts = stockCards.reduce<Record<string, number>>((acc, card) => {
    acc[card.market] = (acc[card.market] ?? 0) + 1;
    return acc;
  }, {});

  return {
    summary: {
      missedCount: missedCards.length,
      rediscoveredCount: stockCards.filter((card) => card.tags.includes('차트자리')).length,
      trackedCount: savedCards.length,
      headline: '이번 주 가장 많이 다시 확인된 유형: 놓친 카드',
      description: '저장하지 않고 넘긴 카드가 다시 차트자리 신호를 보였을 때 재확인이 많았습니다.',
    },
    viewedCards,
    savedCards: savedCards.map((card) => ({ card, result: resultByCardId[card.id] })),
    missedCards,
    themeCounts,
    marketCounts,
    tomorrowCards: stockCards.filter((card) => card.tags.includes('시간외') || card.tags.includes('프리마켓') || card.marketType === 'CRYPTO').slice(0, 4),
    chartSetups,
    formulaCards: stockCards.filter((card) => card.fomoType === 'formula_copy'),
  };
}
