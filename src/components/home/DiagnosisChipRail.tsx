'use client';

import { buildDiagnosisMetrics } from '@/lib/cards/diagnosisMetrics';
import type { DisplayCard } from '@/lib/marketDataTypes';

const toneClass = {
  good: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  neutral: 'border-slate-200 bg-white text-slate-700',
  caution: 'border-amber-200 bg-amber-50 text-amber-700',
  risk: 'border-rose-200 bg-rose-50 text-rose-700',
} as const;

export function DiagnosisChipRail({ card }: { card: DisplayCard }) {
  const metrics = buildDiagnosisMetrics(card);

  return (
    <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max gap-1.5 pr-4 [scroll-snap-type:x_proximity]">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={`min-w-[86px] shrink-0 snap-start rounded-2xl border px-2.5 py-2 ${toneClass[metric.tone]}`}
          >
            <p className="text-[10px] font-black opacity-75">{metric.label}</p>
            <p className="mt-0.5 whitespace-nowrap text-[11px] font-black">{metric.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
