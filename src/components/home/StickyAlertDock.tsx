'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Bell, Bookmark, Info, Layers3, Share2 } from 'lucide-react';
import { ShareCardSheet } from '@/components/home/ShareCardSheet';
import { useAppState } from '@/context/AppStateContext';
import { buildCardEvidenceSentence } from '@/lib/cards/cardUiCopy';
import type { FormulaCandidate, FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';

const AlertSetupModal = dynamic(() => import('@/components/alerts/AlertSetupModal').then((mod) => mod.AlertSetupModal), { ssr: false });

type StickyAlertDockProps = {
  card: DisplayCard;
  formula: FormulaDefinition;
  candidates: FormulaCandidate[];
  alertSummary: string;
  onSimilar: () => void;
  onDetailTop: () => void;
  floating?: boolean;
};

export function StickyAlertDock({ card, formula, candidates, alertSummary, onSimilar, onDetailTop, floating = false }: StickyAlertDockProps) {
  const { saveCard, logEvent, showToast } = useAppState();
  const [alertOpen, setAlertOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const evidenceSentence = buildCardEvidenceSentence(card);

  return (
    <div
      className={
        floating
          ? 'fixed left-1/2 z-40 w-[calc(100vw-32px)] max-w-[398px] -translate-x-1/2 rounded-[28px] border border-slate-200 bg-white/96 p-2 shadow-[0_16px_32px_rgba(15,23,42,0.14)] backdrop-blur'
          : 'rounded-[28px] border border-slate-200 bg-white/96 p-2 shadow-[0_16px_32px_rgba(15,23,42,0.14)] backdrop-blur'
      }
      style={floating ? { bottom: 'calc(env(safe-area-inset-bottom, 0px) + 78px)' } : undefined}
    >
      <button
        type="button"
        onClick={() => {
          logEvent('card_alert_condition_click', { cardKey: card.id, symbol: card.symbol, market: card.market, formulaKey: formula.key, source: 'back_sticky' });
          setAlertOpen(true);
        }}
        className="mb-2 flex w-full items-center justify-between rounded-full bg-blue-50 px-3 py-2 text-left"
      >
        <span className="text-[10px] font-black text-blue-700">알림 조건</span>
        <span className="truncate pl-2 text-[12px] font-black text-slate-950">{alertSummary}</span>
      </button>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            saveCard(card.id, { source: 'card_back_sticky', market: card.market, symbol: card.symbol, assetKey: card.assetKey });
            showToast('관심종목에 저장했습니다.');
          }}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#F4F7FB] text-slate-600"
          aria-label="관심종목 저장"
        >
          <Bookmark className="h-5 w-5" />
        </button>
        <button type="button" onClick={onSimilar} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#F4F7FB] text-slate-600" aria-label="유사 보기">
          <Layers3 className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => {
            logEvent('card_alert_setup_click', { cardKey: card.id, symbol: card.symbol, market: card.market, formulaKey: formula.key, source: 'back_sticky' });
            setAlertOpen(true);
          }}
          className="flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#2563EB_0%,#4F46E5_100%)] px-3 text-sm font-black text-white shadow-[0_10px_20px_rgba(37,99,235,0.25)]"
        >
          <Bell className="h-4 w-4" />
          알림받기
        </button>
        <button
          type="button"
          onClick={() => {
            logEvent('card_share_click', { cardKey: card.id, symbol: card.symbol, market: card.market, formulaKey: formula.key, source: 'back_sticky' });
            setShareOpen(true);
          }}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#F4F7FB] text-slate-600"
          aria-label="카드 공유"
        >
          <Share2 className="h-5 w-5" />
        </button>
        <button type="button" onClick={onDetailTop} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#F4F7FB] text-slate-600" aria-label="상세 상단">
          <Info className="h-5 w-5" />
        </button>
      </div>

      <AlertSetupModal card={card} formula={formula} open={alertOpen} onClose={() => setAlertOpen(false)} />
      <ShareCardSheet open={shareOpen} card={card} formula={formula} candidates={candidates} evidenceSentence={evidenceSentence} onClose={() => setShareOpen(false)} />
    </div>
  );
}
