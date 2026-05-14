'use client';

import { useAppState } from '@/context/AppStateContext';
import type { MarketSession } from './MarketSessionClock';

export type HomeFeedSort = 'gainer' | 'amount';

export function HomeFeedSortTabs({ sort, activeMarket, onChange }: { sort: HomeFeedSort; activeMarket: MarketSession; onChange: (sort: HomeFeedSort) => void }) {
  const { logEvent } = useAppState();
  const select = (next: HomeFeedSort) => {
    logEvent('home_feed_sort_change', { sort: next, activeMarket });
    onChange(next);
  };
  return (
    <div className="sticky top-[84px] z-20 grid grid-cols-2 border-b border-slate-200 bg-[#F8FAFC]/95 px-5 backdrop-blur-xl">
      {[
        ['gainer', '급상승'],
        ['amount', '거래대금'],
      ].map(([key, label]) => (
        <button key={key} type="button" onClick={() => select(key as HomeFeedSort)} className="relative h-12 text-center text-base font-black text-slate-700">
          {label}
          {sort === key ? <span className="absolute bottom-0 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-[#0B63F6]" /> : null}
        </button>
      ))}
    </div>
  );
}
