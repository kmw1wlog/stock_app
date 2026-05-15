'use client';

import Link from 'next/link';
import { useState } from 'react';
import { RelatedStockGrid } from '@/components/home/RelatedStockGrid';
import { useAppState } from '@/context/AppStateContext';
import type { DisplayCard } from '@/lib/marketDataTypes';

export function RelatedStocksPanel({ card, sameThemeCards, sameChartCards }: { card: DisplayCard; sameThemeCards: DisplayCard[]; sameChartCards: DisplayCard[] }) {
  const [mode, setMode] = useState<'theme' | 'chart'>('theme');
  const { logEvent } = useAppState();
  const cards = mode === 'theme' ? sameThemeCards : sameChartCards;
  return (
    <section className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black text-[#0B63F6]">관련 종목</p>
      <h2 className="mt-1 text-2xl font-black">{mode === 'theme' ? '같은 테마' : '같은 차트유형'}</h2>
      <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-1">
        {[
          ['theme', '같은 테마'],
          ['chart', '같은 차트유형'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setMode(key as 'theme' | 'chart');
              logEvent('related_mode_switch', { cardKey: card.id, mode: key });
            }}
            className={mode === key ? 'rounded-xl bg-white py-2 text-sm font-black text-slate-950 shadow-sm' : 'rounded-xl py-2 text-sm font-black text-slate-500'}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm font-semibold leading-6 text-slate-500">
        {mode === 'theme' ? `${card.name}와 함께 움직이는 종목` : '같은 차트자리 후보'}
      </p>
      <div className="mt-3">
        <RelatedStockGrid cards={cards} sourceCardId={card.id} />
      </div>
      {mode === 'theme' ? (
        <p className="mt-auto rounded-2xl bg-orange-50 px-4 py-3 text-sm font-black text-orange-700">테마 공포탐욕: 자료 준비중</p>
      ) : (
        <Link
          href={`/cards/${card.id}/formula`}
          onClick={() => logEvent('chart_type_formula_click', { cardKey: card.id, chartSetupType: card.chartSetupType })}
          className="mt-auto flex h-12 items-center justify-center rounded-2xl bg-[#0B63F6] text-sm font-black text-white"
        >
          이 차트유형 조건식 보기
        </Link>
      )}
    </section>
  );
}
