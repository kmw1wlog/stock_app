'use client';

import { buildDiagnosisMetrics } from '@/lib/cards/diagnosisMetrics';
import type { DisplayCard } from '@/lib/marketDataTypes';

const toneClass = {
  good: 'border-white/10 bg-white/12 text-white',
  neutral: 'border-white/10 bg-white/10 text-blue-50',
  caution: 'border-amber-300/25 bg-amber-300/10 text-amber-100',
  risk: 'border-rose-300/25 bg-rose-300/10 text-rose-100',
} as const;

export function DiagnosisChipRail({ card }: { card: DisplayCard }) {
  const metrics = buildDiagnosisMetrics(card).slice(0, 3);

  return (
    <div className="grid grid-cols-3 gap-2">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={`rounded-[16px] border px-2.5 py-2 ${toneClass[metric.tone]}`}
          >
            <p className="text-[10px] font-black opacity-75">{metric.label}</p>
            <p className="mt-1 whitespace-nowrap text-[11px] font-black">{metric.value}</p>
          </div>
        ))}
    </div>
  );
}
