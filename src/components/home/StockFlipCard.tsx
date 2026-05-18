'use client';

import { type PointerEvent, type TouchEvent, useEffect, useMemo, useRef, useState } from 'react';
import { HomeStockCardQuickBack } from '@/components/home/card/HomeStockCardQuickBack';
import { StockCardBack } from '@/components/home/StockCardBack';
import { StockCardFront } from '@/components/home/StockCardFront';
import { useAppState } from '@/context/AppStateContext';
import { getFormulaCandidatesForCard, type FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';
import { getSameChartTypeCards, getSameThemeCards } from '@/lib/relations/stockRelations';

type BackSection = 'top' | 'news' | 'condition' | 'similar';

type StockFlipCardProps = {
  card: DisplayCard;
  allCards: DisplayCard[];
  formula: FormulaDefinition;
};

type CardSide = 'front' | 'quick' | 'full';
type QuickSection = 'top' | 'news' | 'similar';

export function StockFlipCard({ card, allCards, formula }: StockFlipCardProps) {
  const [side, setSide] = useState<CardSide>('front');
  const [backSection, setBackSection] = useState<BackSection>('top');
  const [quickSection, setQuickSection] = useState<QuickSection>('top');
  const [drag, setDrag] = useState<{ startX: number; startY: number; deltaX: number; deltaY: number; active: boolean; locked?: 'horizontal' | 'vertical' } | null>(null);
  const { logEvent } = useAppState();
  const candidates = useMemo(() => getFormulaCandidatesForCard(card), [card]);
  const sameThemeCards = useMemo(() => getSameThemeCards(card, allCards, 6), [allCards, card]);
  const sameChartCards = useMemo(() => getSameChartTypeCards(card, allCards, 6), [allCards, card]);
  const dragRef = useRef<{ startX: number; startY: number; deltaX: number; deltaY: number; active: boolean; locked?: 'horizontal' | 'vertical' } | null>(null);
  const backOpenedAt = useRef<number | null>(null);

  useEffect(() => {
    logEvent(side === 'front' ? 'stock_flip_front_view' : side === 'quick' ? 'stock_flip_quick_back_view' : 'stock_flip_back_view', {
      cardKey: card.id,
      symbol: card.symbol,
      market: card.market,
      formulaKey: formula.key,
    });
    if (side === 'full') {
      backOpenedAt.current = Date.now();
    }
  }, [card.id, card.market, card.symbol, formula.key, logEvent, side]);

  const openQuick = (source: 'click' | 'swipe', section: QuickSection = 'top') => {
    setQuickSection(section);
    setSide('quick');
    logEvent(source === 'swipe' ? 'card_quick_detail_open_swipe' : 'card_quick_detail_open_click', {
      cardKey: card.id,
      symbol: card.symbol,
      market: card.market,
      formulaKey: formula.key,
      section,
    });
  };

  const openFull = (source: 'click' | 'quick', section: BackSection) => {
    setBackSection(section);
    setSide('full');
    logEvent(source === 'quick' ? 'card_quick_detail_full_open' : 'card_detail_open_click', {
      cardKey: card.id,
      symbol: card.symbol,
      market: card.market,
      formulaKey: formula.key,
      section,
    });
  };

  const closeBack = () => {
    const stayTimeMs = backOpenedAt.current ? Date.now() - backOpenedAt.current : undefined;
    logEvent('card_back_stay_time', { cardKey: card.id, symbol: card.symbol, market: card.market, stayTimeMs });
    setSide('front');
  };

  const isInteractiveTarget = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    return Boolean(target.closest('button, a, input, select, textarea, [role="button"]'));
  };

  const startDrag = (clientX: number, clientY: number) => {
    const nextDrag = { startX: clientX, startY: clientY, deltaX: 0, deltaY: 0, active: true };
    dragRef.current = nextDrag;
    setDrag(nextDrag);
  };

  const moveDrag = (clientX: number, clientY: number) => {
    const current = dragRef.current;
    if (!current?.active) return;
    const deltaX = clientX - current.startX;
    const deltaY = clientY - current.startY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const locked = current.locked ?? (absX > 10 || absY > 10 ? (absX > absY ? 'horizontal' : 'vertical') : undefined);
    const nextDrag = { ...current, deltaX, deltaY, locked };
    dragRef.current = nextDrag;
    setDrag(nextDrag);
  };

  const finishDrag = (source: 'pointer' | 'touch') => {
    const current = dragRef.current;
    if (!current?.active) return;
    const absX = Math.abs(current.deltaX);
    const absY = Math.abs(current.deltaY);
    if (absX > 72 && absX > absY * 1.25) {
      if (current.deltaX < 0 && side === 'front') {
        openQuick('swipe', 'top');
      } else if (current.deltaX > 0 && side !== 'front') {
        closeBack();
      }
      logEvent('stock_flip_drag_complete', {
        cardKey: card.id,
        symbol: card.symbol,
        market: card.market,
        side,
        source,
        deltaX: Math.round(current.deltaX),
      });
    }
    dragRef.current = null;
    setDrag(null);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (isInteractiveTarget(event.target)) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    startDrag(event.clientX, event.clientY);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (isInteractiveTarget(event.target)) return;
    const touch = event.touches[0];
    if (!touch) return;
    startDrag(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    moveDrag(touch.clientX, touch.clientY);
    if (dragRef.current?.locked === 'horizontal') event.preventDefault();
  };

  const dragOffset = drag && drag.locked === 'horizontal' ? Math.max(-26, Math.min(26, drag.deltaX * 0.1)) : 0;

  return (
    <div
      className="px-4 pb-2"
      style={{ touchAction: 'pan-y' }}
      onPointerDown={handlePointerDown}
      onPointerMove={(event) => moveDrag(event.clientX, event.clientY)}
      onPointerUp={() => finishDrag('pointer')}
      onPointerCancel={() => {
        dragRef.current = null;
        setDrag(null);
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => finishDrag('touch')}
      onTouchCancel={() => {
        dragRef.current = null;
        setDrag(null);
      }}
    >
      <div className="transition-transform duration-150 ease-out" style={dragOffset ? { transform: `translateX(${dragOffset}px)` } : undefined}>
        {side === 'front' ? (
        <StockCardFront
          card={card}
          formula={formula}
          candidates={candidates}
          onOpenQuick={(section) => openQuick('click', section ?? 'top')}
          onOpenFull={(section) => openFull('click', section ?? 'top')}
        />
        ) : side === 'quick' ? (
        <HomeStockCardQuickBack
          card={card}
          formula={formula}
          sameThemeCards={sameThemeCards}
          sameChartCards={sameChartCards}
          initialSection={quickSection}
          onShowFront={closeBack}
          onOpenFull={(section) => openFull('quick', section ?? 'top')}
        />
        ) : (
        <StockCardBack
          card={card}
          formula={formula}
          candidates={candidates}
          sameThemeCards={sameThemeCards}
          sameChartCards={sameChartCards}
          initialSection={backSection}
          onShowFront={closeBack}
        />
        )}
      </div>
    </div>
  );
}
