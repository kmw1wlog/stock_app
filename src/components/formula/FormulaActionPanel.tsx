'use client';

import { Copy } from 'lucide-react';
import { ConditionAlertButton } from '@/components/alerts/ConditionAlertButton';
import { MtsViewButton } from '@/components/mts/MtsViewButton';
import { useAppState } from '@/context/AppStateContext';
import { formatFormulaCopy, type FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';

export function FormulaActionPanel({ card, formula }: { card: DisplayCard; formula: FormulaDefinition }) {
  const { copyFormula, showToast, logEvent } = useAppState();
  return (
    <div className="space-y-3">
      <ConditionAlertButton card={card} formula={formula} />
      <button
        type="button"
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-[#0B63F6] bg-white text-base font-black text-[#0B63F6]"
        onClick={async () => {
          const text = formatFormulaCopy(card, formula);
          await navigator.clipboard.writeText(text).catch(() => undefined);
          copyFormula(`${card.id}-${formula.key}`, { cardKey: card.id, assetKey: card.assetKey, symbol: card.symbol, market: card.market, formulaKey: formula.key, platform: 'text' });
          logEvent('formula_copy_text', { cardKey: card.id, assetKey: card.assetKey, symbol: card.symbol, market: card.market, formulaKey: formula.key });
          showToast('조건식 설명을 복사했습니다.');
        }}
      >
        <Copy className="h-5 w-5" />
        조건식 복사
      </button>
      <MtsViewButton card={card} source="formula" />
    </div>
  );
}
