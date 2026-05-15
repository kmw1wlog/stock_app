import type { DisplayCard } from '@/lib/marketDataTypes';

function byAmountOrGain(cards: DisplayCard[]) {
  return [...cards].sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0) || (b.changePct ?? 0) - (a.changePct ?? 0));
}

function completeWithMarket(card: DisplayCard, picked: DisplayCard[], allCards: DisplayCard[], limit: number) {
  const pickedIds = new Set([card.id, ...picked.map((item) => item.id)]);
  const supplements = byAmountOrGain(allCards.filter((item) => item.market === card.market && !pickedIds.has(item.id)));
  return [...picked, ...supplements].slice(0, limit);
}

export function getSameThemeCards(card: DisplayCard, allCards: DisplayCard[], limit = 6): DisplayCard[] {
  const theme = card.theme?.trim();
  const themeLabels = card.labels.filter((label) => label.includes('테마') || Boolean(theme && label.includes(theme)));
  const matched = byAmountOrGain(
    allCards.filter((item) => {
      if (item.id === card.id) return false;
      if (theme && item.theme === theme) return true;
      return themeLabels.some((label) => item.labels.includes(label));
    }),
  );
  return completeWithMarket(card, matched, allCards, limit);
}

export function getSameChartTypeCards(card: DisplayCard, allCards: DisplayCard[], limit = 6): DisplayCard[] {
  const setup = card.chartSetupType?.trim();
  const chartLabels = card.labels.filter((label) => label.includes('차트자리') || label.includes('차트'));
  const matched = byAmountOrGain(
    allCards.filter((item) => {
      if (item.id === card.id) return false;
      if (setup && item.chartSetupType === setup) return true;
      return chartLabels.some((label) => item.labels.includes(label));
    }),
  );
  return completeWithMarket(card, matched, allCards, limit);
}
