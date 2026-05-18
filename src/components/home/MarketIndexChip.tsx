'use client';

import { useState } from 'react';
import { LineChart, X } from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';

const indexItems = [
  { label: 'KOSPI', change: '+0.61%', tone: 'up' },
  { label: 'KOSDAQ', change: '-0.18%', tone: 'down' },
] as const;

export function MarketIndexChip() {
  const [open, setOpen] = useState(false);
  const { logEvent } = useAppState();

  const openSheet = () => {
    logEvent('market_index_chip_click', { source: 'home_header' });
    logEvent('market_index_sheet_open', { source: 'home_header' });
    setOpen(true);
  };

  const closeSheet = () => {
    logEvent('market_index_sheet_close', { source: 'home_header' });
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        className="mt-1 w-full rounded-2xl border border-slate-200/70 bg-white/90 px-2 py-1.5 text-left shadow-lg shadow-slate-900/10 backdrop-blur-xl"
        aria-label="KOSPI KOSDAQ 지수 보기"
      >
        {indexItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-2 text-[10px] font-black leading-4">
            <span className="text-slate-500">{item.label}</span>
            <span className={item.tone === 'up' ? 'text-rose-500' : 'text-blue-600'}>{item.change}</span>
          </div>
        ))}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 px-4 pb-4">
          <section className="w-full max-w-[430px] rounded-[30px] bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black text-[#0B63F6]">국장 지수</p>
                <h2 className="mt-1 text-2xl font-black text-slate-950">KOSPI/KOSDAQ 흐름</h2>
              </div>
              <button type="button" onClick={closeSheet} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100" aria-label="닫기">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <LineChart className="h-4 w-4 text-[#0B63F6]" />
                <p className="text-sm font-black text-slate-900">장중 지수 예시 흐름</p>
              </div>
              <svg viewBox="0 0 320 120" className="h-[140px] w-full overflow-visible">
                <defs>
                  <linearGradient id="indexFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 82 C40 74, 52 62, 80 68 C116 76, 132 50, 164 54 C196 58, 202 36, 232 42 C268 50, 284 28, 320 34 L320 120 L0 120 Z" fill="url(#indexFill)" />
                <path d="M0 82 C40 74, 52 62, 80 68 C116 76, 132 50, 164 54 C196 58, 202 36, 232 42 C268 50, 284 28, 320 34" fill="none" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
              </svg>
              <p className="mt-2 text-xs font-semibold text-slate-500">현재 단계에서는 UI 검수용 지수 fixture입니다. 실시간 지수 API는 별도 worker/DB 단계에서 연결합니다.</p>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
