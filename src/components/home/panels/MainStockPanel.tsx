'use client';

import { AssetChart } from '@/components/chart/AssetChart';
import { Badge } from '@/components/common/Badge';
import { HomeActionButtons } from '@/components/home/HomeActionButtons';
import { MtsViewButton } from '@/components/mts/MtsViewButton';
import { useAppState } from '@/context/AppStateContext';
import type { FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';

function percent(value?: number | null) {
  if (value === null || value === undefined) return '자료 기준';
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function MainStockPanel({ card, formula, onSkip }: { card: DisplayCard; formula: FormulaDefinition; onSkip?: () => void }) {
  const { saveCard, hideCard, logEvent } = useAppState();
  return (
    <section className="flex h-full flex-col rounded-[28px] bg-[#071426] p-5 text-white shadow-2xl shadow-slate-900/20">
      <div className="mb-2 flex flex-wrap gap-2">
        <Badge>{card.marketLabel}</Badge>
        {card.theme ? <Badge tone="gray">{card.theme}</Badge> : null}
        <Badge tone="violet">{formula.shortName}</Badge>
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-3xl font-black">{card.name}</h2>
          <p className="mt-1 text-sm font-bold text-blue-100">{card.symbol}</p>
        </div>
        <p className={(card.changePct ?? 0) < 0 ? 'text-2xl font-black text-blue-200' : 'text-2xl font-black text-red-200'}>{percent(card.changePct)}</p>
      </div>
      <div className="mt-4 overflow-hidden rounded-3xl bg-white p-1">
        <AssetChart compact market={card.market} assetKey={card.assetKey} tvSymbol={card.tvSymbol ?? undefined} coingeckoId={card.coingeckoId ?? undefined} />
      </div>
      <div className="mt-4 rounded-3xl bg-white/10 p-4">
        <p className="text-xs font-black text-blue-100">오늘 포착</p>
        <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-white/85">{card.primaryReason}</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {(card.labels.length ? card.labels : ['공식 데이터 기준', card.dataBasisLabel]).slice(0, 4).map((label) => (
          <span key={label} className="truncate rounded-full bg-white/10 px-3 py-2 text-[11px] font-bold text-blue-100">{label}</span>
        ))}
      </div>
      <div className="mt-auto space-y-3 pt-4">
        <HomeActionButtons
          onSkip={() => {
            hideCard(card.id, { source: 'home_vertical_feed', market: card.market, symbol: card.symbol });
            onSkip?.();
          }}
          onAlert={() => {
            logEvent('main_panel_alert_click', { cardKey: card.id, symbol: card.symbol, market: card.market, formulaKey: formula.key });
            window.setTimeout(() => window.location.assign(`/cards/${card.id}`), 0);
          }}
          onSave={() => saveCard(card.id, { source: 'home_vertical_feed', market: card.market, symbol: card.symbol })}
          onFormula={() => window.setTimeout(() => window.location.assign(`/cards/${card.id}/formula`), 0)}
          onMore={() => window.setTimeout(() => window.location.assign(`/cards/${card.id}`), 0)}
        />
        <MtsViewButton card={card} source="home" variant="primary" label="MTS에서 보기" />
      </div>
    </section>
  );
}
