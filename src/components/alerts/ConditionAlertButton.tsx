'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { AlertSetupModal } from '@/components/alerts/AlertSetupModal';
import { useAppState } from '@/context/AppStateContext';
import type { FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';

type ConditionAlertButtonProps = {
  card: DisplayCard;
  formula: FormulaDefinition;
  className?: string;
  variant?: 'primary' | 'secondary';
};

export function ConditionAlertButton({ card, formula, className = '', variant = 'primary' }: ConditionAlertButtonProps) {
  const [open, setOpen] = useState(false);
  const { logEvent } = useAppState();
  const style =
    variant === 'primary'
      ? 'bg-[#0B63F6] text-white shadow-lg shadow-blue-500/25'
      : 'border border-[#0B63F6] bg-white text-[#0B63F6]';

  return (
    <>
      <button
        type="button"
        className={`flex h-14 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-black ${style} ${className}`}
        onClick={() => {
          logEvent('condition_alert_open_modal', {
            cardKey: card.id,
            assetKey: card.assetKey,
            symbol: card.symbol,
            market: card.market,
            formulaKey: formula.key,
          });
          setOpen(true);
        }}
      >
        <Bell className="h-5 w-5" />
        이 조건 알림 받기
      </button>
      <AlertSetupModal card={card} formula={formula} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
