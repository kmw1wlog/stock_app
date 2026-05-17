'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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

export function StockFlipCard({ card, allCards, formula }: StockFlipCardProps) {
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [backSection, setBackSection] = useState<BackSection>('top');
  const { logEvent } = useAppState();
  const candidates = useMemo(() => getFormulaCandidatesForCard(card), [card]);
  const sameThemeCards = useMemo(() => getSameThemeCards(card, allCards, 6), [allCards, card]);
  const sameChartCards = useMemo(() => getSameChartTypeCards(card, allCards, 6), [allCards, card]);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const backOpenedAt = useRef<number | null>(null);

  useEffect(() => {
    logEvent(side === 'front' ? 'stock_flip_front_view' : 'stock_flip_back_view', {
      cardKey: card.id,
      symbol: card.symbol,
      market: card.market,
      formulaKey: formula.key,
    });
    if (side === 'back') {
      backOpenedAt.current = Date.now();
    }
  }, [card.id, card.market, card.symbol, formula.key, logEvent, side]);

  const openBack = (source: 'click' | 'swipe', section: BackSection) => {
    setBackSection(section);
    setSide('back');
    logEvent(source === 'swipe' ? 'card_detail_open_swipe' : 'card_detail_open_click', {
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

  return (
    <div
      className="px-4 pb-2"
      style={{ touchAction: 'pan-y' }}
      onPointerDown={(event) => {
        pointerStart.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerUp={(event) => {
        if (!pointerStart.current) return;
        const dx = event.clientX - pointerStart.current.x;
        const dy = event.clientY - pointerStart.current.y;
        pointerStart.current = null;
        if (Math.abs(dx) < 70 || Math.abs(dx) <= Math.abs(dy) + 16) return;
        if (dx < 0 && side === 'front') {
          openBack('swipe', 'top');
        } else if (dx > 0 && side === 'back') {
          closeBack();
        }
      }}
    >
      {side === 'front' ? (
        <StockCardFront
          card={card}
          formula={formula}
          candidates={candidates}
          onShowBack={(section) => openBack('click', section ?? 'top')}
        />
      ) : (
        <StockCardBack
          card={card}
          formula={formula}
          sameThemeCards={sameThemeCards}
          sameChartCards={sameChartCards}
          initialSection={backSection}
          onShowFront={closeBack}
        />
      )}
    </div>
  );
}
