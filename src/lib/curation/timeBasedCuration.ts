import type { StockCard } from '@/data/mockStocks';

export function getTimeBasedCards(cards: StockCard[], now = new Date()) {
  const hour = now.getHours();

  if (hour >= 8 && hour < 9) {
    return prioritize(cards, ['KR', 'US', 'CRYPTO'], ['기관외인', '공시', '전일 미장 영향', '차트자리']);
  }
  if (hour >= 9 && hour < 16) {
    return prioritize(cards, ['KR', 'CRYPTO', 'US'], ['오늘 급등', '거래대금', '기관외인', '테마']);
  }
  if (hour >= 16 && hour < 20) {
    return prioritize(cards, ['KR', 'CRYPTO', 'US'], ['공시', '뉴스·공시', '차트자리', '코인 24h']);
  }
  if (hour >= 20 || hour < 6) {
    return prioritize(cards, ['US', 'CRYPTO', 'KR'], ['프리마켓', '실적 이벤트', '미장', '레버리지']);
  }
  return prioritize(cards, ['KR', 'CRYPTO', 'US'], ['오늘 급등', '거래대금', '차트자리']);
}

function prioritize(cards: StockCard[], marketOrder: string[], tagOrder: string[]) {
  return [...cards].sort((a, b) => score(b, marketOrder, tagOrder) - score(a, marketOrder, tagOrder));
}

function score(card: StockCard, marketOrder: string[], tagOrder: string[]) {
  const marketScore = Math.max(0, 10 - marketOrder.indexOf(card.marketType) * 2);
  const tagScore = tagOrder.reduce((sum, tag, index) => sum + (card.tags.includes(tag) || card.fomoMetric === tag ? 8 - index : 0), 0);
  const dataSignalBoost = card.fomoType === 'data_signal' || card.fomoType === 'price_move' || card.fomoType === 'volume_move' ? 2 : 0;
  return marketScore + tagScore + dataSignalBoost;
}
