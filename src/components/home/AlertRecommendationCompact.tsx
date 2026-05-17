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
    <section className="flex min-h-[48px] items-center justify-between gap-3 rounded-[18px] border border-[#D9E7FF] bg-[#EEF5FF] px-3.5 py-2 text-slate-950">
      <div className="min-w-0">
        <p className="text-[10px] font-black text-[#2563EB]">{copy.eyebrow}</p>
        <p className="truncate text-[13px] font-semibold text-slate-600">{copy.summary}</p>
      </div>
      <span className="shrink-0 text-[11px] font-black text-[#2563EB]">{copy.expiresLabel}</span>
    </section>
  );
}
