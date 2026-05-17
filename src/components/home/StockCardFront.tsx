'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { Bell, Bookmark, Info, Share2, Sparkles } from 'lucide-react';
import { AlertRecommendationCompact } from '@/components/home/AlertRecommendationCompact';
import { DiagnosisChipRail } from '@/components/home/DiagnosisChipRail';
import { ShareCardSheet } from '@/components/home/ShareCardSheet';
import { SimilarCardsSheet } from '@/components/home/SimilarCardsSheet';
import { AssetChart } from '@/components/chart/AssetChart';
import { useAppState } from '@/context/AppStateContext';
import {
  buildCardEvidenceSentence,
  buildFrontAnalysisBlocks,
  buildFrontStatusLabel,
  buildFrontTagLabels,
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
  sameThemeCards: DisplayCard[];
  sameChartCards: DisplayCard[];
  onShowBack: () => void;
  onSkip?: () => void;
};

const blockTones = [
  'border-white/8 bg-white/10',
  'border-white/8 bg-white/10',
  'border-blue-300/15 bg-[#123569]',
  'border-amber-300/20 bg-[#3A2B21]',
] as const;

export function StockCardFront({
  card,
  formula,
  candidates,
  sameThemeCards,
  sameChartCards,
  onShowBack,
}: StockCardFrontProps) {
  const { saveCard, logEvent, showToast } = useAppState();
  const [alertFormula, setAlertFormula] = useState<FormulaDefinition | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [similarOpen, setSimilarOpen] = useState(false);
  const evidenceSentence = useMemo(() => buildCardEvidenceSentence(card), [card]);
  const frontTags = useMemo(() => buildFrontTagLabels(card, formula), [card, formula]);
  const statusLabel = useMemo(() => buildFrontStatusLabel(card, formula), [card, formula]);
  const summaryLine = useMemo(() => buildOneLineWhySummary(card), [card]);
  const summaryMeta = useMemo(() => buildSummaryMeta(card), [card]);
  const priceLabel = useMemo(() => buildSummaryPrice(card), [card]);
  const changeLabel = useMemo(() => buildSummaryChange(card), [card]);
  const tradeLine = useMemo(() => buildSummaryTradeLine(card), [card]);
  const analysisBlocks = useMemo(() => buildFrontAnalysisBlocks(card), [card]);

  return (
    <div className="flex flex-col">
      <article className="overflow-hidden rounded-[30px] border border-[#D9E1F3] bg-[linear-gradient(180deg,#082247_0%,#071B38_100%)] px-4 pb-3 pt-3 text-white shadow-[0_16px_36px_rgba(8,27,56,0.16)]">
        <div className="flex min-w-0 flex-nowrap gap-1.5 overflow-x-auto pb-1 pr-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {frontTags.map((tag, index) => (
            <span key={`${tag}-${index}`} className="inline-flex h-7 items-center whitespace-nowrap rounded-full border border-white/12 bg-white/10 px-2.5 text-[11px] font-black text-blue-50">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-2 rounded-[24px] border border-white/10 bg-white/9 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-[27px] font-black leading-none text-white">{card.name}</h2>
              <p className="mt-1 truncate text-[13px] font-semibold text-blue-100/80">{summaryMeta}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[18px] font-black text-white">{priceLabel}</p>
              <p className="mt-1 text-sm font-black text-blue-100">{changeLabel}</p>
            </div>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#1D4ED8] px-3 py-1.5 text-[10px] font-black text-white">{statusLabel}</span>
            <p className="min-w-0 flex-1 text-[12px] font-semibold leading-5 text-blue-50/90">{tradeLine}</p>
          </div>
        </div>

        <div className="mt-2.5 rounded-[18px] border border-white/8 bg-white/95 p-1.5">
          <AssetChart compact market={card.market} assetKey={card.assetKey} tvSymbol={card.tvSymbol ?? undefined} coingeckoId={card.coingeckoId ?? undefined} />
        </div>

        <p className="mt-2.5 line-clamp-2 px-1 text-[13px] font-black leading-5 text-white">{summaryLine}</p>

        <div className="mt-2.5">
          <DiagnosisChipRail card={card} />
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-2">
          {analysisBlocks.map((block, index) => (
            <section key={block.label} className={`rounded-[18px] border px-3 py-2 ${blockTones[index % blockTones.length]}`}>
              <p className="text-[11px] font-black text-blue-100/80">{block.label}</p>
              <p className="mt-1.5 line-clamp-2 text-[11px] font-semibold leading-5 text-white/92">{block.summary}</p>
            </section>
          ))}
        </div>

        <div className="mt-2.5">
          <AlertRecommendationCompact card={card} formula={formula} candidates={candidates} />
        </div>
      </article>

      <div className="-mt-5 shrink-0 px-2" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)' }}>
        <div className="mx-auto flex max-w-[390px] items-center gap-1.5 rounded-full border border-[#E2EAF7] bg-white/96 px-2 py-1.5 shadow-[0_12px_28px_rgba(16,32,51,0.10)] backdrop-blur">
          <button
            type="button"
            onClick={() => {
              saveCard(card.id, { source: 'home_flip_front', market: card.market, symbol: card.symbol, assetKey: card.assetKey });
              showToast('관심종목에 추가했습니다. 알림은 중앙 버튼에서 설정할 수 있습니다.');
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
              logEvent('similar_cards_open', { cardKey: card.id, symbol: card.symbol, market: card.market });
              setSimilarOpen(true);
            }}
            className="flex h-[50px] w-[50px] shrink-0 flex-col items-center justify-center rounded-full bg-[#F4F7FB] text-slate-600"
            aria-label="비슷한 종목 보기"
          >
            <Sparkles className="h-[18px] w-[18px]" />
            <span className="mt-1 text-[10px] font-black">유사</span>
          </button>
          <button
            type="button"
            onClick={() => {
              logEvent('main_panel_alert_click', {
                cardKey: card.id,
                symbol: card.symbol,
                market: card.market,
                formulaKey: formula.key,
                evidenceSentence,
                summaryLine,
              });
              setAlertFormula(formula);
            }}
            className="flex h-[50px] min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-[#1D4ED8] px-4 text-sm font-black text-white shadow-[0_10px_20px_rgba(37,99,235,0.28)]"
            aria-label="이 조건으로 알림 받기"
          >
            <Bell className="h-[18px] w-[18px] shrink-0" />
            <span className="truncate">알림받기</span>
          </button>
          <button
            type="button"
            onClick={() => {
              logEvent('card_share_open', { cardKey: card.id, symbol: card.symbol, market: card.market, formulaKey: formula.key });
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
              logEvent('stock_flip_back_view_request', { cardKey: card.id, symbol: card.symbol, market: card.market, formulaKey: formula.key });
              onShowBack();
            }}
            className="flex h-[50px] w-[50px] shrink-0 flex-col items-center justify-center rounded-full bg-[#F4F7FB] text-slate-600"
            aria-label="카드 상세 보기"
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
      <SimilarCardsSheet
        open={similarOpen}
        sourceCard={card}
        sameThemeCards={sameThemeCards}
        sameChartCards={sameChartCards}
        onClose={() => setSimilarOpen(false)}
      />
    </div>
  );
}
