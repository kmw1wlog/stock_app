'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { useAppState } from '@/context/AppStateContext';
import type { DisplayCard } from '@/lib/marketDataTypes';

export function SearchSuggestionList({ cards, query, source }: { cards: DisplayCard[]; query: string; source: 'suggestion' | 'result' }) {
  const { logEvent } = useAppState();
  if (!cards.length) {
    return <p className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-sm font-bold text-slate-500">검색 결과 없음</p>;
  }
  return (
    <div className="space-y-2">
      {cards.map((card) => (
        <Link
          key={card.id}
          href={`/cards/${card.id}`}
          onClick={() => logEvent(source === 'suggestion' ? 'search_suggestion_click' : 'search_result_click', { query, cardKey: card.id, symbol: card.symbol, market: card.market })}
          className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="min-w-0">
            <div className="mb-1 flex gap-1">
              <Badge tone="blue">{card.marketLabel}</Badge>
              {card.theme ? <Badge tone="gray">{card.theme}</Badge> : null}
            </div>
            <p className="truncate text-base font-black text-slate-950">{card.name}</p>
            <p className="mt-1 text-xs font-bold text-slate-500">{card.symbol} · {card.dataBasisLabel}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </Link>
      ))}
    </div>
  );
}
