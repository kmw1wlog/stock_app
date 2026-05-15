import Link from 'next/link';
import { ChevronRight, Flame, MoreVertical } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { SignalChart } from '@/components/common/SignalChart';
import type { StockCard } from '@/data/mockStocks';

export function SavedCardItem({ card, status }: { card: StockCard; status: string }) {
  return (
    <Link href={`/cards/${card.id}`} className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="h-32 w-32 shrink-0 overflow-hidden rounded-2xl">
        <SignalChart compact />
      </div>
      <div className="min-w-0 flex-1 py-1">
        <div className="flex items-center justify-between gap-2">
          <Badge tone={status === '관심' ? 'red' : status === '관찰 중' ? 'orange' : 'blue'}>{status}</Badge>
          <MoreVertical className="h-5 w-5 text-slate-400" />
        </div>
        <h3 className="mt-3 truncate text-xl font-black">{card.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-600">{card.titleReason}</p>
        <p className="mt-3 flex items-center gap-2 text-xs font-bold text-[#0B63F6]">
          <Flame className="h-4 w-4" />
          {card.savedListCopy}
        </p>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-sm font-bold text-slate-600">
          상세 보기
          <ChevronRight className="h-5 w-5" />
        </div>
      </div>
    </Link>
  );
}
