'use client';

import { buildDiagnosisMetrics } from '@/lib/cards/diagnosisMetrics';
import type { DisplayCard } from '@/lib/marketDataTypes';

const toneClass = {
  good: 'border-blue-200/70 bg-[#F4F8FF] text-[#1854C7]',
  neutral: 'border-slate-200/70 bg-[#F7FAFF] text-slate-700',
  caution: 'border-amber-200/70 bg-[#FFF7E8] text-amber-700',
  risk: 'border-rose-200/70 bg-[#FFF2F4] text-rose-700',
} as const;

export function DiagnosisChipRail({ card }: { card: DisplayCard }) {
  const metrics = buildDiagnosisMetrics(card);

  return (
    <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max gap-1.5 pr-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={`min-w-[78px] shrink-0 rounded-[18px] border px-2.5 py-1.5 ${toneClass[metric.tone]}`}
          >
            <p className="text-[10px] font-black opacity-70">{metric.label}</p>
            <p className="mt-0.5 whitespace-nowrap text-[11px] font-black">{metric.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
