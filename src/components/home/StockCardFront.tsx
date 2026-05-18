'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { Bell, ChevronRight } from 'lucide-react';
import { HomeCardActionDock } from '@/components/home/card/HomeCardActionDock';
import { ShareCardSheet } from '@/components/home/ShareCardSheet';
import { AssetChart } from '@/components/chart/AssetChart';
import { useAppState } from '@/context/AppStateContext';
import { buildFrontCardViewModel } from '@/lib/cards/frontCardViewModel';
import { type FormulaCandidate, type FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';

const AlertSetupModal = dynamic(() => import('@/components/alerts/AlertSetupModal').then((mod) => mod.AlertSetupModal), { ssr: false });

function tagClassName(index: number) {
  if (index === 2) {
    return 'inline-flex h-7 items-center whitespace-nowrap rounded-full bg-violet-100 px-2.5 text-[11px] font-black text-violet-700 shadow-sm shadow-violet-950/10';
  }
  return 'inline-flex h-7 items-center whitespace-nowrap rounded-full bg-white px-2.5 text-[11px] font-black text-[#071A3A] shadow-sm shadow-slate-950/10';
}

type StockCardFrontProps = {
  card: DisplayCard;
  formula: FormulaDefinition;
  candidates: FormulaCandidate[];
  onOpenQuick: (section?: 'top' | 'news' | 'similar') => void;
  onOpenFull: (section?: 'top' | 'news' | 'condition' | 'similar') => void;
};

export function StockCardFront({ card, formula, candidates, onOpenQuick, onOpenFull }: StockCardFrontProps) {
  const { saveCard, logEvent, showToast } = useAppState();
  const [alertFormula, setAlertFormula] = useState<FormulaDefinition | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const vm = useMemo(() => buildFrontCardViewModel(card, formula), [card, formula]);

  return (
    <div className="flex flex-col">
      <article className="overflow-hidden rounded-[30px] border border-[#D8E2F4] bg-[linear-gradient(180deg,#09244A_0%,#071A3A_100%)] px-4 pb-3 pt-3 text-white shadow-[0_16px_32px_rgba(8,27,56,0.16)]">
        <div className="flex min-w-0 flex-nowrap gap-1.5 overflow-x-auto pb-1 pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {vm.tags.map((tag, index) => (
            <span key={`${tag}-${index}`} className={tagClassName(index)}>
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-2 rounded-[24px] border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-[28px] font-black leading-none text-white">{card.name}</h2>
              <p className="mt-1 truncate text-[13px] font-semibold text-blue-100/80">{vm.summaryMeta}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[18px] font-black text-white">{vm.priceLabel}</p>
              <p className="mt-1 text-[18px] font-black text-blue-100">{vm.changeLabel}</p>
            </div>
          </div>
          <p className="mt-3 text-[12px] font-semibold text-blue-50/90">{vm.tradeLine}</p>
        </div>

        <p className="mt-3 text-[15px] font-black leading-6 text-white">{vm.oneLineSummary}</p>

        <button
          type="button"
          onClick={() => {
            logEvent('card_news_open', { cardKey: card.id, symbol: card.symbol, market: card.market, source: 'front_news_sentence' });
            onOpenQuick('news');
          }}
          className="mt-2 flex w-full items-center justify-between rounded-[18px] border border-white/10 bg-white/8 px-3 py-2.5 text-left"
        >
          <div className="min-w-0">
            <p className="text-[10px] font-black text-blue-100/80">관련 뉴스</p>
            <p className="truncate text-[12px] font-semibold text-blue-50">{vm.newsSentence}</p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-blue-100/70" />
        </button>

        {vm.facts.length ? (
          <div className="mt-2 rounded-full border border-white/10 bg-white/10 px-3 py-2">
            <div className={`grid gap-2 ${vm.facts.length === 1 ? 'grid-cols-1' : vm.facts.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {vm.facts.map((fact, index) => (
                <div key={`${fact}-${index}`} className={`min-w-0 ${index !== 0 ? 'border-l border-white/12 pl-2' : ''}`}>
                  <p className="truncate text-[11px] font-black text-blue-50">{fact}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-3 rounded-[18px] border border-white/8 bg-white/95 p-1.5">
          <AssetChart compact market={card.market} assetKey={card.assetKey} tvSymbol={card.tvSymbol ?? undefined} coingeckoId={card.coingeckoId ?? undefined} />
        </div>

        <button
          type="button"
          onClick={() => {
            logEvent('card_alert_condition_click', { cardKey: card.id, symbol: card.symbol, market: card.market, formulaKey: formula.key });
            onOpenFull('condition');
          }}
          className="mt-3 flex w-full items-center justify-between rounded-[18px] border border-white/10 bg-white/10 px-3 py-2.5 text-left"
        >
          <div className="flex min-w-0 items-center gap-2">
            <Bell className="h-4 w-4 shrink-0 text-blue-100" />
            <div className="min-w-0">
              <p className="text-[10px] font-black text-blue-100/80">알림 조건</p>
              <p className="truncate text-[13px] font-semibold text-white">{vm.alertCondition}</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-blue-100/70" />
        </button>
      </article>

      <div className="mt-3 shrink-0 px-2" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)' }}>
        <HomeCardActionDock
          onSave={() => {
            saveCard(card.id, { source: 'home_flip_front', market: card.market, symbol: card.symbol, assetKey: card.assetKey });
            showToast('관심종목에 저장했습니다.');
          }}
          onSimilar={() => {
            logEvent('similar_view_open', { cardKey: card.id, symbol: card.symbol, market: card.market, source: 'front_dock' });
            onOpenQuick('similar');
          }}
          onAlert={() => {
            logEvent('card_alert_setup_click', { cardKey: card.id, symbol: card.symbol, market: card.market, formulaKey: formula.key, source: 'front_dock' });
            setAlertFormula(formula);
          }}
          onShare={() => {
            logEvent('card_share_click', { cardKey: card.id, symbol: card.symbol, market: card.market, formulaKey: formula.key });
            setShareOpen(true);
          }}
          onDetail={() => {
            logEvent('card_detail_open_click', { cardKey: card.id, symbol: card.symbol, market: card.market, formulaKey: formula.key });
            onOpenFull('top');
          }}
        />
      </div>

      <AlertSetupModal card={card} formula={alertFormula ?? formula} open={Boolean(alertFormula)} onClose={() => setAlertFormula(null)} />
      <ShareCardSheet
        open={shareOpen}
        card={card}
        formula={formula}
        candidates={candidates}
        evidenceSentence={vm.evidenceSentence}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}
