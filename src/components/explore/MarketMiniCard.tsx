import Link from 'next/link';
import { Sparkline } from '@/components/common/Sparkline';

export function MarketMiniCard({ label, name, rate, cardId, hint }: { label: string; name: string; rate: number; cardId: string; hint?: string }) {
  return (
    <Link href={`/cards/${cardId}`} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-xs font-black text-[#0B63F6]">{label}</p>
      <p className="mt-2 truncate text-sm font-black text-slate-950">{name}</p>
      <p className="text-sm font-black text-red-500">+{rate.toFixed(2)}%</p>
      {hint ? <p className="mt-1 line-clamp-2 text-[11px] font-bold leading-4 text-slate-500">{hint}</p> : null}
      <Sparkline small tone="red" />
    </Link>
  );
}
