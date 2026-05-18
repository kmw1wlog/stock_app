'use client';

import { MarketSessionClock, type MarketSession } from '@/components/home/MarketSessionClock';
import { MarketIndexChip } from '@/components/home/MarketIndexChip';

type HomeHeaderProps = {
  activeMarket: MarketSession;
  sessionMode: 'auto' | 'manual';
  onMarketChange: (market: MarketSession, mode: 'auto' | 'manual') => void;
};

export function HomeHeader({ activeMarket, sessionMode, onMarketChange }: HomeHeaderProps) {
  return (
    <header
      className="pointer-events-none fixed right-3 z-40"
      style={{ top: 'calc(env(safe-area-inset-top, 0px) + 8px)' }}
    >
      <div className="pointer-events-auto rounded-full border border-slate-200/70 bg-white/88 px-2 py-2 shadow-lg shadow-slate-900/10 backdrop-blur-xl">
        <MarketSessionClock activeMarket={activeMarket} mode={sessionMode} onChange={onMarketChange} compact />
      </div>
      <div className="pointer-events-auto">
        <MarketIndexChip />
      </div>
    </header>
  );
}
