'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { Bell, Bookmark, ChevronRight, Info, Layers3, Share2 } from 'lucide-react';
import { AlertRecommendationCompact } from '@/components/home/AlertRecommendationCompact';
import { ShareCardSheet } from '@/components/home/ShareCardSheet';
import { AssetChart } from '@/components/chart/AssetChart';
import { useAppState } from '@/context/AppStateContext';
import {
  buildAlertConditionSummary,
  buildCardEvidenceSentence,
  buildFrontFacts,
  buildFrontTagLabels,
  buildNewsReactionSentence,
  buildOneLineWhySummary,
  buildSummaryChange,
  buildSummaryMeta,
  buildSummaryPrice,
  buildSummaryTradeLine,
} from '@/lib/cards/cardUiCopy';
import { type FormulaCandidate, type FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';

const AlertSetupModal = dynamic(() => import('@/components/alerts/AlertSetupModal').then((mod) => mod.AlertSetupModal), { ssr: false });

type StockCardFrontProps = {
  card: DisplayCard;
  formula: FormulaDefinition;
  candidates: FormulaCandidate[];
  onShowBack: (section?: 'top' | 'news' | 'condition' | 'similar') => void;
};

export function StockCardFront({ card, formula, candidates, onShowBack }: StockCardFrontProps) {
  const { saveCard, logEvent, showToast } = useAppState();
  const [alertFormula, setAlertFormula] = useState<FormulaDefinition | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const evidenceSentence = useMemo(() => buildCardEvidenceSentence(card), [card]);
  const frontTags = useMemo(() => buildFrontTagLabels(card, formula), [card, formula]);
  const summaryMeta = useMemo(() => buildSummaryMeta(card), [card]);
  const priceLabel = useMemo(() => buildSummaryPrice(card), [card]);
  const changeLabel = useMemo(() => buildSummaryChange(card), [card]);
  const tradeLine = useMemo(() => buildSummaryTradeLine(card), [card]);
  const oneLineSummary = useMemo(() => buildOneLineWhySummary(card), [card]);
  const newsSentence = useMemo(() => buildNewsReactionSentence(card), [card]);
  const facts = useMemo(() => buildFrontFacts(card), [card]);
  const alertCondition = useMemo(() => buildAlertConditionSummary(card, formula), [card, formula]);

  return (
    <div className="flex flex-col">
      <article className="overflow-hidden rounded-[30px] border border-[#D8E2F4] bg-[linear-gradient(180deg,#09244A_0%,#071A3A_100%)] px-4 pb-3 pt-3 text-white shadow-[0_16px_32px_rgba(8,27,56,0.16)]">
        <div className="flex min-w-0 flex-nowrap gap-1.5 overflow-x-auto pb-1 pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {frontTags.map((tag, index) => (
            <span key={`${tag}-${index}`} className="inline-flex h-7 items-center whitespace-nowrap rounded-full border border-white/12 bg-white/10 px-2.5 text-[11px] font-black text-blue-50">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-2 rounded-[24px] border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-[28px] font-black leading-none text-white">{card.name}</h2>
              <p className="mt-1 truncate text-[13px] font-semibold text-blue-100/80">{summaryMeta}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[18px] font-black text-white">{priceLabel}</p>
              <p className="mt-1 text-[18px] font-black text-blue-100">{changeLabel}</p>
            </div>
          </div>
          <p className="mt-3 text-[12px] font-semibold text-blue-50/90">{tradeLine}</p>
        </div>

        <p className="mt-3 text-[15px] font-black leading-6 text-white">{oneLineSummary}</p>

        <button
          type="button"
          onClick={() => {
            logEvent('card_news_open', { cardKey: card.id, symbol: card.symbol, market: card.market, source: 'front_news_sentence' });
            onShowBack('news');
          }}
          className="mt-2 flex w-full items-center justify-between rounded-[18px] border border-white/10 bg-white/8 px-3 py-2.5 text-left"
        >
          <div className="min-w-0">
            <p className="text-[10px] font-black text-blue-100/80">관련 뉴스</p>
            <p className="truncate text-[12px] font-semibold text-blue-50">{newsSentence}</p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-blue-100/70" />
        </button>

        <div className="mt-2 rounded-full border border-white/10 bg-white/10 px-3 py-2">
          <div className="grid grid-cols-3 gap-2">
            {facts.map((fact, index) => (
              <div key={`${fact.value}-${index}`} className={`min-w-0 ${index !== 0 ? 'border-l border-white/12 pl-2' : ''}`}>
                <p className="truncate text-[11px] font-black text-blue-50">{fact.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 rounded-[18px] border border-white/8 bg-white/95 p-1.5">
          <AssetChart compact market={card.market} assetKey={card.assetKey} tvSymbol={card.tvSymbol ?? undefined} coingeckoId={card.coingeckoId ?? undefined} />
        </div>

        <button
          type="button"
          onClick={() => {
            logEvent('card_alert_condition_click', { cardKey: card.id, symbol: card.symbol, market: card.market, formulaKey: formula.key });
            onShowBack('condition');
          }}
          className="mt-3 flex w-full items-center justify-between rounded-[18px] border border-white/10 bg-white/10 px-3 py-2.5 text-left"
        >
          <div className="flex min-w-0 items-center gap-2">
            <Bell className="h-4 w-4 shrink-0 text-blue-100" />
            <div className="min-w-0">
              <p className="text-[10px] font-black text-blue-100/80">알림 조건</p>
              <p className="truncate text-[13px] font-semibold text-white">{alertCondition}</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-blue-100/70" />
        </button>
      </article>

      <div className="-mt-5 shrink-0 px-2" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)' }}>
        <div className="mx-auto flex max-w-[390px] items-center gap-1.5 rounded-full border border-[#E2EAF7] bg-white/96 px-2 py-1.5 shadow-[0_12px_28px_rgba(16,32,51,0.10)] backdrop-blur">
          <button
            type="button"
            onClick={() => {
              saveCard(card.id, { source: 'home_flip_front', market: card.market, symbol: card.symbol, assetKey: card.assetKey });
              showToast('관심종목에 저장했습니다.');
            }}
            className="flex h-[50px] w-[50px] shrink-0 flex-col items-center justify-center rounded-full bg-[#F4F7FB] text-slate-600"
            aria-label="관심종목 저장"
          >
            <Bookmark className="h-[18px] w-[18px]" />
            <span className="mt-1 text-[10px] font-black">저장</span>
          </button>
          <button
            type="button"
            onClick={() => {
              logEvent('similar_view_open', { cardKey: card.id, symbol: card.symbol, market: card.market, source: 'front_dock' });
              onShowBack('similar');
            }}
            className="flex h-[50px] w-[50px] shrink-0 flex-col items-center justify-center rounded-full bg-[#F4F7FB] text-slate-600"
            aria-label="유사 보기"
          >
            <Layers3 className="h-[18px] w-[18px]" />
            <span className="mt-1 text-[10px] font-black">유사</span>
          </button>
          <button
            type="button"
            onClick={() => {
              logEvent('card_alert_setup_click', { cardKey: card.id, symbol: card.symbol, market: card.market, formulaKey: formula.key, source: 'front_dock' });
              setAlertFormula(formula);
            }}
            className="flex h-[50px] min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#2563EB_0%,#4F46E5_100%)] px-4 text-sm font-black text-white shadow-[0_10px_20px_rgba(37,99,235,0.28)]"
            aria-label="이 조건으로 알림 받기"
          >
            <Bell className="h-[18px] w-[18px] shrink-0" />
            <span className="truncate">알림받기</span>
          </button>
          <button
            type="button"
            onClick={() => {
              logEvent('card_share_click', { cardKey: card.id, symbol: card.symbol, market: card.market, formulaKey: formula.key });
              setShareOpen(true);
            }}
            className="flex h-[50px] w-[50px] shrink-0 flex-col items-center justify-center rounded-full bg-[#F4F7FB] text-slate-600"
            aria-label="카드 공유"
          >
            <Share2 className="h-[18px] w-[18px]" />
            <span className="mt-1 text-[10px] font-black">공유</span>
          </button>
          <button
            type="button"
            onClick={() => {
              logEvent('card_detail_open_click', { cardKey: card.id, symbol: card.symbol, market: card.market, formulaKey: formula.key });
              onShowBack('top');
            }}
            className="flex h-[50px] w-[50px] shrink-0 flex-col items-center justify-center rounded-full bg-[#F4F7FB] text-slate-600"
            aria-label="상세 보기"
          >
            <Info className="h-[18px] w-[18px]" />
            <span className="mt-1 text-[10px] font-black">상세</span>
          </button>
        </div>
      </div>

      <AlertSetupModal card={card} formula={alertFormula ?? formula} open={Boolean(alertFormula)} onClose={() => setAlertFormula(null)} />
      <ShareCardSheet
        open={shareOpen}
        card={card}
        formula={formula}
        candidates={candidates}
        evidenceSentence={evidenceSentence}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}
