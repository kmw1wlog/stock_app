'use client';

import { StockFlipCard } from '@/components/home/StockFlipCard';
import { getFormulaForCard } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';

export function StockSwipeStack({ card, allCards, onSkip }: { card: DisplayCard; allCards: DisplayCard[]; onSkip?: () => void }) {
  const formula = getFormulaForCard(card);
  return (
    <article className="h-[calc(100dvh-84px)] snap-start py-1.5">
      <StockFlipCard card={card} allCards={allCards} formula={formula} onSkip={onSkip} />
    </article>
  );
}
