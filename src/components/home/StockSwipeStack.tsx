'use client';

import { StockHorizontalCarousel } from '@/components/home/StockHorizontalCarousel';
import { getFormulaForCard } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';

export function StockSwipeStack({ card, allCards, onSkip }: { card: DisplayCard; allCards: DisplayCard[]; onSkip?: () => void }) {
  const formula = getFormulaForCard(card);
  return (
    <article className="h-[82dvh] snap-start py-2">
      <StockHorizontalCarousel card={card} allCards={allCards} formula={formula} onSkip={onSkip} />
    </article>
  );
}
