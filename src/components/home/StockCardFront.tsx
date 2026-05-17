'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { Bell, Bookmark, Info, Share2, X } from 'lucide-react';
import { AlertRecommendationCompact } from '@/components/home/AlertRecommendationCompact';
import { DiagnosisChipRail } from '@/components/home/DiagnosisChipRail';
import { ShareCardSheet } from '@/components/home/ShareCardSheet';
import { AssetChart } from '@/components/chart/AssetChart';
import { useAppState } from '@/context/AppStateContext';
import { buildCardEvidenceSentence, buildFrontTagLabels } from '@/lib/cards/cardUiCopy';
import { type FormulaCandidate, type FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';

const AlertSetupModal = dynamic(() => import('@/components/alerts/AlertSetupModal').then((mod) => mod.AlertSetupModal), { ssr: false });

function percent(value?: number | null) {
  if (value === null || value === undefined) return '관찰중';
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}

type StockCardFrontProps = {
  card: DisplayCard;
  formula: FormulaDefinition;
  candidates: FormulaCandidate[];
  onShowBack: () => void;
  onSkip?: () => void;
};

export function StockCardFront({ card, formula, candidates, onShowBack, onSkip }: StockCardFrontProps) {
  const { saveCard, hideCard, logEvent, showToast } = useAppState();
  const [alertFormula, setAlertFormula] = useState<FormulaDefinition | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const evidenceSentence = useMemo(() => buildCardEvidenceSentence(card), [card]);
  const frontTags = useMemo(() => buildFrontTagLabels(card, formula), [card, formula]);

  return (
    <div className="flex h-full flex-col">
      <article className="overflow-hidden rounded-[32px] bg-[linear-gradient(180deg,#0B2A4A_0%,#08213F_58%,#071A33_100%)] px-4 pb-4 pt-3 text-white shadow-[0_24px_60px_rgba(3,15,35,0.22)]">
        <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max flex-nowrap gap-1.5 pr-2">
            {frontTags.map((tag, index) => (
              <span key={`${tag}-${index}`} className="inline-flex h-7 items-center whitespace-nowrap rounded-full border border-white/14 bg-white/10 px-2.5 text-[11px] font-black text-blue-50">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-[29px] font-black leading-none">{card.name}</h2>
            <p className="mt-1 text-sm font-bold text-blue-100/90">{card.symbol}</p>
          </div>
          <p className={(card.changePct ?? 0) < 0 ? 'text-[28px] font-black text-sky-200' : 'text-[28px] font-black text-red-200'}>{percent(card.changePct)}</p>
        </div>

        <div className="mt-3 overflow-hidden rounded-[24px] bg-[#F4F8FF] p-1.5">
          <AssetChart compact market={card.market} assetKey={card.assetKey} tvSymbol={card.tvSymbol ?? undefined} coingeckoId={card.coingeckoId ?? undefined} />
        </div>

        <div className="mt-2.5">
          <DiagnosisChipRail card={card} />
        </div>

        <div className="mt-3">
          <AlertRecommendationCompact card={card} formula={formula} candidates={candidates} />
        </div>
      </article>

      <div className="mt-3 shrink-0 px-1" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)' }}>
        <div className="flex items-center gap-2.5 rounded-[28px] bg-white/55 px-2 py-2 backdrop-blur-md">
          <button
            type="button"
            onClick={() => {
              hideCard(card.id, { source: 'home_flip_front', market: card.market, symbol: card.symbol });
              onSkip?.();
            }}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#EAF2FF] text-slate-700 shadow-sm"
            aria-label="관심 없음으로 넘기기"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            onClick={() => {
              saveCard(card.id, { source: 'home_flip_front', market: card.market, symbol: card.symbol, assetKey: card.assetKey });
              showToast('관심종목에 추가했습니다. 조건 알림은 따로 설정해야 합니다.');
            }}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#EAF2FF] text-slate-700 shadow-sm"
            aria-label="관심종목 추가"
          >
            <Bookmark className="h-[18px] w-[18px]" />
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
              });
              setAlertFormula(formula);
            }}
            className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-[#2563EB] px-5 text-sm font-black text-white shadow-lg shadow-blue-500/25"
            aria-label="이 조건 알림 받기"
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
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#EAF2FF] text-slate-700 shadow-sm"
            aria-label="카드 공유"
          >
            <Share2 className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            onClick={() => {
              logEvent('stock_flip_back_view_request', { cardKey: card.id, symbol: card.symbol, market: card.market, formulaKey: formula.key });
              onShowBack();
            }}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#EAF2FF] text-slate-700 shadow-sm"
            aria-label="카드 상세 보기"
          >
            <Info className="h-[18px] w-[18px]" />
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
