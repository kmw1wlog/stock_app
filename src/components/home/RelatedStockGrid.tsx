'use client';

import Link from 'next/link';
import { useAppState } from '@/context/AppStateContext';
import type { DisplayCard } from '@/lib/marketDataTypes';

export function RelatedStockGrid({ cards, sourceCardId }: { cards: DisplayCard[]; sourceCardId: string }) {
  const { logEvent } = useAppState();
  return (
    <div className="grid grid-cols-2 gap-2">
      {cards.slice(0, 6).map((card) => (
        <Link
          key={card.id}
          href={`/cards/${card.id}`}
          onClick={() => logEvent('related_stock_click', { sourceCardId, cardKey: card.id, symbol: card.symbol, market: card.market })}
          className="rounded-2xl border border-slate-200 bg-white p-3"
        >
          <p className="truncate text-sm font-black text-slate-950">{card.name}</p>
          <p className={(card.changePct ?? 0) < 0 ? 'mt-1 text-sm font-black text-blue-500' : 'mt-1 text-sm font-black text-red-500'}>
            {card.changePct === null || card.changePct === undefined ? '자료 기준' : `${card.changePct > 0 ? '+' : ''}${card.changePct.toFixed(2)}%`}
          </p>
        </Link>
      ))}
    </div>
  );
}
