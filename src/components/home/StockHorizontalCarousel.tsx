'use client';

import { MainStockPanel } from '@/components/home/panels/MainStockPanel';
import { DailyChartPanel } from '@/components/home/panels/DailyChartPanel';
import { FinancialPanel } from '@/components/home/panels/FinancialPanel';
import { RelatedStocksPanel } from '@/components/home/panels/RelatedStocksPanel';
import type { FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';
import { getSameChartTypeCards, getSameThemeCards } from '@/lib/relations/stockRelations';

export function StockHorizontalCarousel({ card, allCards, formula, onSkip }: { card: DisplayCard; allCards: DisplayCard[]; formula: FormulaDefinition; onSkip?: () => void }) {
  const sameThemeCards = getSameThemeCards(card, allCards, 6);
  const sameChartCards = getSameChartTypeCards(card, allCards, 6);
  return (
    <div className="hide-scrollbar flex h-full snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
      <div className="h-full w-[86vw] max-w-[370px] shrink-0 snap-center">
        <MainStockPanel card={card} formula={formula} onSkip={onSkip} />
      </div>
      <div className="h-full w-[86vw] max-w-[370px] shrink-0 snap-center">
        <DailyChartPanel card={card} />
      </div>
      <div className="h-full w-[86vw] max-w-[370px] shrink-0 snap-center">
        <FinancialPanel card={card} />
      </div>
      <div className="h-full w-[86vw] max-w-[370px] shrink-0 snap-center">
        <RelatedStocksPanel card={card} sameThemeCards={sameThemeCards} sameChartCards={sameChartCards} />
      </div>
    </div>
  );
}
