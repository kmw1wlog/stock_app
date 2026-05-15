'use client';

import { MarketSessionClock, type MarketSession } from '@/components/home/MarketSessionClock';

type HomeHeaderProps = {
  activeMarket: MarketSession;
  sessionMode: 'auto' | 'manual';
  onMarketChange: (market: MarketSession, mode: 'auto' | 'manual') => void;
};

export function HomeHeader({ activeMarket, sessionMode, onMarketChange }: HomeHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-[#F8FAFC]/95 px-5 pb-3 pt-3 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black text-[#0B63F6]">급등주 for you</p>
          <h1 className="mt-0.5 text-2xl font-black tracking-normal">오늘의 흐름 포착</h1>
          <p className="mt-1 text-xs font-semibold text-slate-500">세로로 넘기고, 한 종목은 가로로 더 봅니다.</p>
        </div>
        <MarketSessionClock activeMarket={activeMarket} mode={sessionMode} onChange={onMarketChange} />
      </div>
    </header>
  );
}
