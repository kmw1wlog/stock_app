'use client';

import type { FormulaCandidate, FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';
import { buildAlertRecommendationCopy } from '@/lib/cards/cardUiCopy';

type AlertRecommendationCompactProps = {
  card: DisplayCard;
  formula: FormulaDefinition;
  candidates: FormulaCandidate[];
};

export function AlertRecommendationCompact({ card, formula, candidates }: AlertRecommendationCompactProps) {
  const copy = buildAlertRecommendationCopy(card, formula, candidates);

  return (
    <section className="flex min-h-[48px] items-center gap-3 rounded-[18px] border border-white/10 bg-white/10 px-3.5 py-2.5 text-white">
      <span className="shrink-0 rounded-full bg-white/14 px-2.5 py-1 text-[10px] font-black text-blue-50">{copy.eyebrow}</span>
      <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-blue-50">{copy.summary}</p>
      <span className="shrink-0 text-[11px] font-black text-blue-100/90">{copy.expiresLabel}</span>
    </section>
  );
}
