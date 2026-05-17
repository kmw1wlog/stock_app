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
  const metrics = buildDiagnosisMetrics(card).filter((metric) => ['신호', '거래', '변동성'].includes(metric.label)).slice(0, 3);

  return (
    <div className="grid grid-cols-3 gap-2">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={`rounded-[18px] border px-2.5 py-2 ${toneClass[metric.tone]}`}
          >
            <p className="text-[10px] font-black opacity-70">{metric.label}</p>
            <p className="mt-0.5 whitespace-nowrap text-[11px] font-black">{metric.value}</p>
          </div>
        ))}
    </div>
  );
}
