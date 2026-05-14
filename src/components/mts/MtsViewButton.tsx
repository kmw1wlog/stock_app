'use client';

import { ExternalLink } from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import type { DisplayCard } from '@/lib/marketDataTypes';

type MtsViewButtonProps = {
  card: DisplayCard;
  source: 'home' | 'detail' | 'formula' | 'saved' | 'alert';
  variant?: 'primary' | 'secondary';
  className?: string;
  label?: string;
};

export function MtsViewButton({ card, source, variant = 'secondary', className = '', label = 'MTS에서 종목 보기' }: MtsViewButtonProps) {
  const { logEvent } = useAppState();
  const style =
    variant === 'primary'
      ? 'bg-slate-950 text-white shadow-lg shadow-slate-900/20'
      : 'border border-slate-200 bg-white text-slate-950';
  return (
    <button
      type="button"
      className={`flex h-14 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-black ${style} ${className}`}
      onClick={() => {
        logEvent('mts_cta_click', { cardKey: card.id, assetKey: card.assetKey, symbol: card.symbol, market: card.market, source });
        const params = new URLSearchParams({
          cardKey: card.id,
          assetKey: card.assetKey,
          symbol: card.symbol,
          name: card.name,
          source,
        });
        window.setTimeout(() => window.location.assign(`/mts/select?${params.toString()}`), 0);
      }}
    >
      <ExternalLink className="h-5 w-5" />
      {label}
    </button>
  );
}
