'use client';

import { ExternalLink } from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { opendartSearchUrl } from '@/lib/externalLinks';
import type { DisplayCard } from '@/lib/marketDataTypes';

export function FinancialPanel({ card }: { card: DisplayCard }) {
  const { logEvent } = useAppState();
  const rows = [
    ['매출 흐름', '자료 준비중'],
    ['영업이익', card.labels.some((label) => label.includes('실적') || label.includes('공시')) ? '공시 확인 필요' : '자료 준비중'],
    ['PER', '자료 부족'],
    ['PBR', '자료 부족'],
    ['부채비율', '자료 부족'],
  ];
  return (
    <section className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black text-[#0B63F6]">재무·가치 체크</p>
      <h2 className="mt-1 text-2xl font-black">{card.name}</h2>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">가짜 재무 수치는 표시하지 않습니다. 공식 공시와 확인 가능한 지표만 라벨로 보여줍니다.</p>
      <div className="mt-5 space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <span className="text-sm font-bold text-slate-500">{label}</span>
            <span className="text-sm font-black text-slate-950">{value}</span>
          </div>
        ))}
      </div>
      <a
        href={opendartSearchUrl(card.name, card.symbol)}
        target="_blank"
        rel="noreferrer"
        onClick={() => logEvent('opendart_click', { cardKey: card.id, symbol: card.symbol, market: card.market, source: 'home_financial_panel' })}
        className="mt-auto flex h-14 items-center justify-center gap-2 rounded-2xl border border-[#0B63F6] bg-white text-sm font-black text-[#0B63F6]"
      >
        OpenDART에서 확인
        <ExternalLink className="h-4 w-4" />
      </a>
    </section>
  );
}
