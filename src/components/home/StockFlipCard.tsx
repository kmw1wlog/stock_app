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
    <div className="px-4 pb-2">
      {side === 'front' ? (
        <StockCardFront card={card} formula={formula} candidates={candidates} onShowBack={() => setSide('back')} onSkip={onSkip} />
      ) : (
        <StockCardBack card={card} formula={formula} sameThemeCards={sameThemeCards} sameChartCards={sameChartCards} onShowFront={() => setSide('front')} />
      )}
    </div>
  );
}
