import { buildOneLineWhySummary } from '@/lib/cards/cardUiCopy';
import type { DisplayCard } from '@/lib/marketDataTypes';

export type SimilarPreviewItem = {
  id: string;
  name: string;
  label: string;
  summary: string;
  changeLabel: string;
};

function fromCard(card: DisplayCard, label: string): SimilarPreviewItem {
  return {
    id: card.id,
    name: card.name,
    label,
    summary: buildOneLineWhySummary(card),
    changeLabel: typeof card.changePct === 'number' ? `${card.changePct > 0 ? '+' : ''}${card.changePct.toFixed(1)}%` : '관찰',
  };
}

function fallback(card: DisplayCard, label: string, suffix: string): SimilarPreviewItem {
  const theme = card.theme?.split(/[·,/|]/)[0]?.trim() || '국장';
  return {
    id: `${card.id}-${label}-fallback`,
    name: `${theme} ${suffix}`,
    label,
    summary: `${card.name}와 함께 확인할 ${label} 후보입니다.`,
    changeLabel: '확인',
  };
}

export function buildQuickSimilarItems(card: DisplayCard, sameThemeCards: DisplayCard[], sameChartCards: DisplayCard[]) {
  return [
    sameChartCards[0] ? fromCard(sameChartCards[0], '같은 차트자리') : fallback(card, '같은 차트자리', '후보'),
    sameThemeCards[0] ? fromCard(sameThemeCards[0], '같은 테마') : fallback(card, '같은 테마', '관련주'),
    [...sameChartCards, ...sameThemeCards].find((item) => item.id !== sameChartCards[0]?.id && item.id !== sameThemeCards[0]?.id)
      ? fromCard(
          [...sameChartCards, ...sameThemeCards].find((item) => item.id !== sameChartCards[0]?.id && item.id !== sameThemeCards[0]?.id)!,
          '비슷한 반응',
        )
      : fallback(card, '비슷한 반응', '과거 사례'),
  ];
}
