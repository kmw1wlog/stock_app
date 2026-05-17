'use client';

import { StockFlipCard } from '@/components/home/StockFlipCard';
import { getFormulaForCard } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';

export function StockSwipeStack({ card, allCards, onSkip }: { card: DisplayCard; allCards: DisplayCard[]; onSkip?: () => void }) {
  const formula = getFormulaForCard(card);
  return (
    <article className="mb-5 min-h-[calc(100dvh-190px)] py-1">
      <StockFlipCard card={card} allCards={allCards} formula={formula} onSkip={onSkip} />
    </article>
  );
}
