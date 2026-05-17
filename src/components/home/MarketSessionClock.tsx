'use client';

import { useState } from 'react';
import { Clock3, X } from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';

export type MarketSession = 'KR' | 'CRYPTO' | 'US';

export type MarketSessionClockProps = {
  activeMarket: MarketSession;
  mode: 'auto' | 'manual';
  onChange: (market: MarketSession, mode: 'auto' | 'manual') => void;
  compact?: boolean;
};

const marketLabels: Record<MarketSession, string> = {
  KR: '국내',
  CRYPTO: '코인',
  US: '미국',
};

export function getDefaultMarketByTime(date = new Date()): MarketSession {
  const hour = date.getHours();
  if (hour >= 7 && hour < 16) return 'KR';
  if (hour >= 16 && hour < 22) return 'CRYPTO';
  return 'US';
}

function handRotation(activeMarket: MarketSession) {
  if (activeMarket === 'KR') return 130;
  if (activeMarket === 'CRYPTO') return 235;
  return 345;
}

export function MarketSessionClock({ activeMarket, mode, onChange, compact = false }: MarketSessionClockProps) {
  const [open, setOpen] = useState(false);
  const { logEvent } = useAppState();
  const rotation = handRotation(activeMarket);

  const select = (market: MarketSession, nextMode: 'auto' | 'manual') => {
    logEvent(nextMode === 'auto' ? 'market_session_auto_restore' : 'market_session_change', { market, mode: nextMode });
    onChange(market, nextMode);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        aria-label="시장 선택"
        onClick={() => {
          logEvent('market_session_clock_click', { activeMarket, mode });
          setOpen(true);
        }}
        className={
          compact
            ? 'flex h-10 items-center gap-2 rounded-full px-3 text-slate-900'
            : 'relative grid h-12 w-12 place-items-center rounded-full border border-slate-200 bg-white shadow-sm'
        }
      >
        {compact ? (
          <>
            <span className="relative grid h-6 w-6 place-items-center">
              <Clock3 className="h-5 w-5 text-slate-900" />
              <span
                className="absolute left-1/2 top-1/2 h-[9px] w-[2px] origin-bottom rounded-full bg-[#0B63F6]"
                style={{ transform: `translate(-50%, -100%) rotate(${rotation}deg)` }}
              />
            </span>
            <span className="text-xs font-black">{marketLabels[activeMarket]}</span>
            <span className="rounded-full bg-slate-950 px-1.5 py-0.5 text-[9px] font-black text-white">{mode === 'auto' ? 'AUTO' : 'MANUAL'}</span>
          </>
        ) : (
          <>
            <Clock3 className="h-8 w-8 text-slate-900" />
            <span
              className="absolute left-1/2 top-1/2 h-[18px] w-[2px] origin-bottom rounded-full bg-[#0B63F6]"
              style={{ transform: `translate(-50%, -100%) rotate(${rotation}deg)` }}
            />
            <span className="absolute -bottom-1 rounded-full bg-slate-950 px-1.5 py-0.5 text-[9px] font-black text-white">{marketLabels[activeMarket]}</span>
          </>
        )}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 px-4 pb-4">
          <section className="w-full max-w-[430px] rounded-[28px] bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">시장 선택</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">자동: 현재 시간 기준</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100" aria-label="닫기">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 text-center text-xs font-bold text-slate-600">
              <span>국내 07~16</span>
              <span>코인 16~22</span>
              <span>미국 22~07</span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              <button onClick={() => select(getDefaultMarketByTime(), 'auto')} className={mode === 'auto' ? 'rounded-2xl bg-slate-950 py-3 text-sm font-black text-white' : 'rounded-2xl border border-slate-200 py-3 text-sm font-black text-slate-700'}>자동</button>
              {(['KR', 'CRYPTO', 'US'] as const).map((market) => (
                <button
                  key={market}
                  onClick={() => select(market, 'manual')}
                  className={mode === 'manual' && activeMarket === market ? 'rounded-2xl bg-[#0B63F6] py-3 text-sm font-black text-white' : 'rounded-2xl border border-slate-200 py-3 text-sm font-black text-slate-700'}
                >
                  {marketLabels[market]}
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
