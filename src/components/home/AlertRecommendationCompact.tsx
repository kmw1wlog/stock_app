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
    <section className="rounded-[22px] border border-[#BFD3F7]/30 bg-[#EAF2FF]/95 px-4 py-3 text-slate-950 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-black text-[#2563EB]">{copy.eyebrow}</p>
        <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-black text-[#2563EB]">{copy.expiresLabel}</span>
      </div>
      <h3 className="mt-1 text-[16px] font-black leading-5 text-slate-950">{copy.title}</h3>
      <p className="mt-1 line-clamp-1 text-[13px] font-semibold leading-5 text-slate-600">{copy.summary}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black text-slate-700">{copy.scopeChip}</span>
        <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black text-slate-700">{copy.spreadChip}</span>
      </div>
    </section>
  );
}
