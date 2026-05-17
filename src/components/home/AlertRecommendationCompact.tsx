'use client';

import type { FormulaCandidate, FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';
import { buildAlertRecommendationCopy } from '@/lib/cards/cardUiCopy';

type AlertRecommendationCompactProps = {
  card: DisplayCard;
  formula: FormulaDefinition;
  candidates: FormulaCandidate[];
  onOpenCandidates: () => void;
};

export function AlertRecommendationCompact({ card, formula, candidates, onOpenCandidates }: AlertRecommendationCompactProps) {
  const copy = buildAlertRecommendationCopy(card, formula, candidates);

  return (
    <section className="rounded-[24px] border border-white/14 bg-white/12 px-4 py-3 text-white">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-black text-blue-100/90">{copy.eyebrow}</p>
        <span className="rounded-full bg-white/12 px-2 py-1 text-[10px] font-black text-blue-100">{copy.expiresLabel}</span>
      </div>
      <h3 className="mt-1 text-[17px] font-black leading-5">{copy.title}</h3>
      <p className="mt-1 line-clamp-2 text-[13px] font-semibold leading-5 text-blue-50/90">{copy.summary}</p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-black text-white/90">{copy.scopeChip}</span>
          <span className="rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-black text-white/90">{copy.spreadChip}</span>
        </div>
        <button type="button" onClick={onOpenCandidates} className="shrink-0 text-[11px] font-black text-blue-100">
          {copy.detailCtaLabel}
        </button>
      </div>
      <p className="mt-2 text-[10px] font-semibold text-blue-100/60">{copy.disclaimer}</p>
    </section>
  );
}
