'use client';

import { type PointerEvent, useEffect, useMemo, useState } from 'react';
import { StockCardBack } from '@/components/home/StockCardBack';
import { StockCardFront } from '@/components/home/StockCardFront';
import { useAppState } from '@/context/AppStateContext';
import { getFormulaCandidatesForCard, type FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';
import { getSameChartTypeCards, getSameThemeCards } from '@/lib/relations/stockRelations';

type StockFlipCardProps = {
  card: DisplayCard;
  allCards: DisplayCard[];
  formula: FormulaDefinition;
  onSkip?: () => void;
};

export function StockFlipCard({ card, allCards, formula, onSkip }: StockFlipCardProps) {
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [drag, setDrag] = useState<{ startX: number; startY: number; deltaX: number; deltaY: number; active: boolean } | null>(null);
  const { logEvent } = useAppState();
  const candidates = useMemo(() => getFormulaCandidatesForCard(card), [card]);
  const sameThemeCards = useMemo(() => getSameThemeCards(card, allCards, 6), [allCards, card]);
  const sameChartCards = useMemo(() => getSameChartTypeCards(card, allCards, 6), [allCards, card]);

  useEffect(() => {
    logEvent(side === 'front' ? 'stock_flip_front_view' : 'stock_flip_back_view', {
      cardKey: card.id,
      symbol: card.symbol,
      market: card.market,
      formulaKey: formula.key,
    });
  }, [card.id, card.market, card.symbol, formula.key, logEvent, side]);

  const showSide = (nextSide: 'front' | 'back', source: 'button' | 'drag') => {
    if (nextSide === side) return;
    logEvent('stock_flip_side_change', {
      cardKey: card.id,
      symbol: card.symbol,
      market: card.market,
      fromSide: side,
      toSide: nextSide,
      source,
    });
    setSide(nextSide);
  };

  const isInteractiveTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(target.closest('button, a, input, select, textarea, [role="button"]'));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (isInteractiveTarget(event.target)) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    setDrag({ startX: event.clientX, startY: event.clientY, deltaX: 0, deltaY: 0, active: true });
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    setDrag((current) => {
      if (!current?.active) return current;
      return {
        ...current,
        deltaX: event.clientX - current.startX,
        deltaY: event.clientY - current.startY,
      };
    });
  };

  const finishDrag = () => {
    if (!drag?.active) return;
    const absX = Math.abs(drag.deltaX);
    const absY = Math.abs(drag.deltaY);
    if (absX > 72 && absX > absY * 1.25) {
      showSide(side === 'front' ? 'back' : 'front', 'drag');
    }
    setDrag(null);
  };

  const dragOffset = drag && Math.abs(drag.deltaX) > Math.abs(drag.deltaY) ? Math.max(-22, Math.min(22, drag.deltaX * 0.08)) : 0;

  return (
    <div className="h-full px-4 pb-2">
      <div
        className="relative h-full touch-pan-y select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={() => setDrag(null)}
        style={{ transform: `translateX(${dragOffset}px)` }}
      >
        <div className={side === 'front' ? 'h-full opacity-100 transition-opacity duration-200' : 'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200'}>
          <StockCardFront card={card} formula={formula} candidates={candidates} onShowBack={() => showSide('back', 'button')} onSkip={onSkip} />
        </div>
        <div className={side === 'back' ? 'h-full opacity-100 transition-opacity duration-200' : 'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200'}>
          <StockCardBack card={card} formula={formula} sameThemeCards={sameThemeCards} sameChartCards={sameChartCards} onShowFront={() => showSide('front', 'button')} />
        </div>
      </div>
    </div>
  );
}
