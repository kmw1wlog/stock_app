'use client';

import { useEffect, useMemo, useState } from 'react';
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

  return (
    <div className="h-full px-4 pb-2">
      <div className="relative h-full">
        <div className={side === 'front' ? 'h-full opacity-100 transition-opacity duration-200' : 'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200'}>
          <StockCardFront card={card} formula={formula} candidates={candidates} onShowBack={() => setSide('back')} onSkip={onSkip} />
        </div>
        <div className={side === 'back' ? 'h-full opacity-100 transition-opacity duration-200' : 'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200'}>
          <StockCardBack card={card} formula={formula} sameThemeCards={sameThemeCards} sameChartCards={sameChartCards} onShowFront={() => setSide('front')} />
        </div>
      </div>
    </div>
  );
}
