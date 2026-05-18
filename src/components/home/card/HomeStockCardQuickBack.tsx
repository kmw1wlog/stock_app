'use client';

import { ArrowLeft, ChevronRight, Newspaper, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { useAppState } from '@/context/AppStateContext';
import { buildFrontCardViewModel } from '@/lib/cards/frontCardViewModel';
import { buildQuickSimilarItems } from '@/lib/cards/similarCardViewModel';
import type { FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';

type QuickBackSection = 'top' | 'news' | 'similar';

type HomeStockCardQuickBackProps = {
  card: DisplayCard;
  formula: FormulaDefinition;
  sameThemeCards: DisplayCard[];
  sameChartCards: DisplayCard[];
  initialSection?: QuickBackSection;
  onShowFront: () => void;
  onOpenFull: (section?: 'top' | 'news' | 'condition' | 'similar') => void;
};

export function HomeStockCardQuickBack({
  card,
  formula,
  sameThemeCards,
  sameChartCards,
  initialSection = 'top',
  onShowFront,
  onOpenFull,
}: HomeStockCardQuickBackProps) {
  const { logEvent } = useAppState();
  const vm = useMemo(() => buildFrontCardViewModel(card, formula), [card, formula]);
  const similarItems = useMemo(() => buildQuickSimilarItems(card, sameThemeCards, sameChartCards), [card, sameChartCards, sameThemeCards]);

  return (
    <article className="rounded-[30px] border border-[#D8E2F4] bg-white p-4 shadow-[0_16px_32px_rgba(8,27,56,0.12)]">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onShowFront}
          className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          앞면
        </button>
        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-black text-blue-700">빠른 상세</span>
      </div>

      <div className="mt-4 rounded-[26px] bg-[linear-gradient(180deg,#09244A_0%,#071A3A_100%)] px-4 py-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-2xl font-black">{card.name}</h2>
            <p className="mt-1 text-xs font-semibold text-blue-100/80">{card.symbol} · {vm.summaryMeta}</p>
          </div>
          <div className="text-right">
            <p className="text-base font-black">{vm.priceLabel}</p>
            <p className="mt-1 text-sm font-black text-blue-100">{vm.changeLabel}</p>
          </div>
        </div>
        <p className="mt-3 text-sm font-black leading-6">{vm.oneLineSummary}</p>
      </div>

      <button
        type="button"
        onClick={() => {
          logEvent('card_quick_detail_news_click', { cardKey: card.id, symbol: card.symbol, market: card.market, section: initialSection });
          onOpenFull('news');
        }}
        className="mt-4 flex w-full items-center justify-between rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-left"
      >
        <div className="flex min-w-0 items-start gap-3">
          <Newspaper className="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]" />
          <div className="min-w-0">
            <p className="text-xs font-black text-slate-500">뉴스 출처 확인</p>
            <p className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-slate-800">{vm.newsSentence}</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
      </button>

      <section className="mt-4">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#2563EB]" />
          <h3 className="text-sm font-black text-slate-950">빠르게 볼 유사 흐름</h3>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {similarItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                logEvent('card_quick_detail_similar_click', { cardKey: card.id, symbol: card.symbol, market: card.market, target: item.id, label: item.label });
                onOpenFull('similar');
              }}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-black text-[#2563EB]">{item.label}</p>
                  <p className="mt-1 truncate text-sm font-black text-slate-950">{item.name}</p>
                  <p className="mt-1 line-clamp-1 text-[12px] font-semibold text-slate-500">{item.summary}</p>
                </div>
                <span className="shrink-0 text-xs font-black text-rose-500">{item.changeLabel}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={() => {
          logEvent('card_quick_detail_full_open', { cardKey: card.id, symbol: card.symbol, market: card.market });
          onOpenFull(initialSection === 'similar' ? 'similar' : initialSection === 'news' ? 'news' : 'top');
        }}
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0B63F6] text-sm font-black text-white"
      >
        상세 더보기
        <ChevronRight className="h-4 w-4" />
      </button>
    </article>
  );
}
