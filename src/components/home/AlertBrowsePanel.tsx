'use client';

import { useMemo, useState } from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';
import { AlertSetupModal } from '@/components/alerts/AlertSetupModal';
import { useAppState } from '@/context/AppStateContext';
import { alertEngineCatalog, alertEngineToFormula, pickRecommendedAlertEngine, type AlertEngineItem } from '@/lib/cards/alertEngineCatalog';
import { buildAlertConditionSummary } from '@/lib/cards/cardUiCopy';
import type { FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';

type AlertBrowsePanelProps = {
  card: DisplayCard;
  formula: FormulaDefinition;
};

function isEngineApplicable(card: DisplayCard, engine: AlertEngineItem) {
  if (engine.code === 'H' || engine.code === 'O') return typeof card.changePct === 'number';
  if (engine.code === 'B' || engine.code === 'C' || engine.code === 'D' || engine.code === 'E') return Boolean(card.chartSetupType || card.changePct !== null);
  return Boolean(card.amount || card.volume || card.changePct !== null || card.theme);
}

export function AlertBrowsePanel({ card, formula }: AlertBrowsePanelProps) {
  const { logEvent } = useAppState();
  const recommended = useMemo(() => pickRecommendedAlertEngine(formula.key), [formula.key]);
  const [selectedEngine, setSelectedEngine] = useState<AlertEngineItem | null>(null);
  const selectedFormula = selectedEngine ? alertEngineToFormula(selectedEngine) : formula;

  return (
    <section className="mt-5 rounded-[28px] border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black text-[#2563EB]">자체 알람 엔진</p>
          <h3 className="mt-1 text-base font-black text-slate-950">알람 둘러보기</h3>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-black text-blue-700">A-O</span>
      </div>

      <button
        type="button"
        onClick={() => {
          logEvent('alert_browse_open', { cardKey: card.id, symbol: card.symbol, market: card.market, formulaKey: formula.key });
          logEvent('alert_engine_apply', { cardKey: card.id, symbol: card.symbol, market: card.market, alertEngineKey: recommended.key, alertEngineCode: recommended.code });
          setSelectedEngine(recommended);
        }}
        className="mt-4 w-full rounded-2xl border border-blue-200 bg-blue-50 px-3 py-3 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-black text-blue-700">현재 카드 추천</p>
            <p className="mt-1 text-sm font-black text-slate-950">
              {recommended.code} {recommended.name}
            </p>
            <p className="mt-1 text-[12px] font-semibold leading-5 text-slate-600">{buildAlertConditionSummary(card, formula)} · {recommended.easyRule}</p>
          </div>
          <Bell className="h-5 w-5 shrink-0 text-blue-600" />
        </div>
      </button>

      <div className="mt-4 grid grid-cols-1 gap-2">
        {alertEngineCatalog.map((engine) => {
          const applicable = isEngineApplicable(card, engine);
          return (
            <button
              key={engine.key}
              type="button"
              onClick={() => {
                logEvent('alert_engine_card_click', { cardKey: card.id, symbol: card.symbol, market: card.market, alertEngineKey: engine.key, alertEngineCode: engine.code });
                logEvent('alert_engine_select', { cardKey: card.id, symbol: card.symbol, market: card.market, alertEngineKey: engine.key, alertEngineCode: engine.code });
                logEvent('alert_engine_apply', { cardKey: card.id, symbol: card.symbol, market: card.market, alertEngineKey: engine.key, alertEngineCode: engine.code });
                setSelectedEngine(engine);
              }}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-left"
            >
              <div className="flex items-start gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-black text-white">{engine.code}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-black text-slate-950">{engine.name}</p>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black ${applicable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {applicable ? '적용 가능' : '관찰용'}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-[12px] font-semibold text-slate-600">{engine.summary}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="truncate text-[11px] font-bold text-slate-500">{engine.easyRule}</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-[#2563EB]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      이 알람으로 받기
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <AlertSetupModal
        card={card}
        formula={selectedFormula}
        open={Boolean(selectedEngine)}
        onClose={() => setSelectedEngine(null)}
      />
    </section>
  );
}
