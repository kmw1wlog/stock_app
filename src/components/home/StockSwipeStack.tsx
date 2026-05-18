'use client';

import { StockFlipCard } from '@/components/home/StockFlipCard';
import { getFormulaForCard } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';

export function StockSwipeStack({ card, allCards }: { card: DisplayCard; allCards: DisplayCard[] }) {
  const formula = getFormulaForCard(card);
  return (
    <article className="mb-4 py-1">
      <StockFlipCard card={card} allCards={allCards} formula={formula} />
    </article>
  );
}
