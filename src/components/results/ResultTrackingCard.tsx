import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Sparkline } from '@/components/common/Sparkline';
import type { StockCard } from '@/data/mockStocks';

type Result = { mine: number; similar: number; status: '추적 중' | '수익권' | '주의' | '놓친 카드'; note: string; missed?: boolean };

export function ResultTrackingCard({ card, result }: { card: StockCard; result: Result }) {
  const negative = result.mine < 0;
  const statusClass =
    result.status === '주의'
      ? 'border-orange-200 bg-orange-50 text-orange-600'
      : result.status === '수익권'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
        : result.status === '놓친 카드'
          ? 'border-red-200 bg-red-50 text-red-600'
          : 'border-blue-200 bg-blue-50 text-[#0B63F6]';

  return (
    <Link href={`/cards/${card.id}`} className="block rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl font-black">{card.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-500">{card.theme} · {card.titleReason}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-3 py-1 text-sm font-black ${statusClass}`}>{result.status}</span>
      </div>
      <div className="mt-4 grid grid-cols-[1fr_1fr] gap-3">
        <div className={negative ? 'rounded-2xl bg-orange-50 p-3' : 'rounded-2xl bg-blue-50 p-3'}>
          <p className="text-xs font-bold text-slate-500">내 결과</p>
          <p className={negative ? 'text-3xl font-black text-orange-600' : 'text-3xl font-black text-[#0B63F6]'}>{result.mine > 0 ? '+' : ''}{result.mine}%</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-xs font-bold text-slate-500">비슷한 사용자 평균</p>
          <p className="text-2xl font-black text-[#0B63F6]">{result.similar > 0 ? '+' : ''}{result.similar}%</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <Sparkline small tone={negative ? 'orange' : result.missed ? 'red' : 'blue'} />
        <span className="rounded-full bg-slate-50 px-3 py-2 text-xs font-black text-slate-500">{card.fomoMetric}</span>
      </div>
      <div className={negative || result.missed ? 'mt-4 flex items-center justify-between rounded-2xl bg-orange-50 p-3 text-sm font-bold text-orange-700' : 'mt-4 flex items-center justify-between rounded-2xl bg-blue-50 p-3 text-sm font-bold text-slate-700'}>
        {result.note}
        <ChevronRight className="h-5 w-5 shrink-0" />
      </div>
    </Link>
  );
}
