'use client';

import { Copy, Share2, X } from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { buildAlertRecommendationCopy, buildShareText, type AlertRecommendationCopy } from '@/lib/cards/cardUiCopy';
import type { FormulaCandidate, FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';

type ShareCardSheetProps = {
  open: boolean;
  card: DisplayCard;
  formula: FormulaDefinition;
  candidates: FormulaCandidate[];
  evidenceSentence: string;
  onClose: () => void;
};

export function ShareCardSheet({ open, card, formula, candidates, evidenceSentence, onClose }: ShareCardSheetProps) {
  const { logEvent, showToast } = useAppState();
  if (!open) return null;

  const alertCopy: AlertRecommendationCopy = buildAlertRecommendationCopy(card, formula, candidates);
  const shareUrl = typeof window === 'undefined' ? `/cards/${card.id}` : `${window.location.origin}/cards/${card.id}`;
  const shareText = buildShareText({
    card,
    formula,
    evidenceSentence,
    alertCopy,
    origin: typeof window === 'undefined' ? undefined : window.location.origin,
  });

  const onShare = async () => {
    const browserNavigator = typeof window !== 'undefined' ? window.navigator : undefined;

    if (browserNavigator?.share) {
      try {
        await browserNavigator.share({
          title: `${card.name} 흐름 카드`,
          text: shareText,
          url: shareUrl,
        });
        logEvent('card_share_native', { cardKey: card.id, symbol: card.symbol, market: card.market, formulaKey: formula.key });
      } catch {
        return;
      }
      return;
    }

    if (browserNavigator?.clipboard?.writeText) {
      await browserNavigator.clipboard.writeText(shareText);
      logEvent('card_share_copy', { cardKey: card.id, symbol: card.symbol, market: card.market, formulaKey: formula.key });
      showToast('공유 문구를 복사했습니다.');
      return;
    }

    window.prompt('공유 문구를 복사하세요.', shareText);
  };

  const onCopy = async () => {
    const browserNavigator = typeof window !== 'undefined' ? window.navigator : undefined;
    if (browserNavigator?.clipboard?.writeText) {
      await browserNavigator.clipboard.writeText(shareText);
      logEvent('card_share_copy', { cardKey: card.id, symbol: card.symbol, market: card.market, formulaKey: formula.key });
      showToast('공유 문구를 복사했습니다.');
      return;
    }
    window.prompt('공유 문구를 복사하세요.', shareText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 px-4 pb-4">
      <section className="w-full max-w-[430px] rounded-[28px] bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black text-[#0B63F6]">카드 공유</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">{card.name} 흐름 카드</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100" aria-label="닫기">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-black text-slate-950">{card.symbol} · {card.marketLabel}</p>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">{evidenceSentence}</p>
          <p className="mt-2 text-sm font-semibold text-slate-700">{alertCopy.shareSummary}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{formula.name} · {alertCopy.expiresLabel}</p>
          <p className="mt-3 text-[11px] font-semibold leading-5 text-slate-500">투자 추천이 아닌 참고용 정보입니다.</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onShare}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#0B63F6] text-sm font-black text-white"
          >
            <Share2 className="h-4 w-4" />
            공유하기
          </button>
          <button
            type="button"
            onClick={onCopy}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-700"
          >
            <Copy className="h-4 w-4" />
            텍스트 복사
          </button>
        </div>
      </section>
    </div>
  );
}
