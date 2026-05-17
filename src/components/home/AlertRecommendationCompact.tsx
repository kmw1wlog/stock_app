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
    <section className="rounded-3xl bg-white p-4 text-slate-950">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black text-[#0B63F6]">{copy.eyebrow}</p>
          <h3 className="mt-1 text-base font-black leading-5">{copy.title}</h3>
        </div>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-black text-[#0B63F6]">{copy.expiresLabel}</span>
      </div>
      <p className="mt-2 text-sm font-bold text-slate-700">{copy.conditionLine}</p>
      <p className="mt-1.5 text-xs font-semibold leading-5 text-slate-500">{copy.summary}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-700">{copy.scopeChip}</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-700">{copy.spreadChip}</span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold text-slate-400">{copy.disclaimer}</p>
        <button type="button" onClick={onOpenCandidates} className="shrink-0 text-xs font-black text-[#0B63F6]">
          {copy.detailCtaLabel}
        </button>
      </div>
    </section>
  );
}
