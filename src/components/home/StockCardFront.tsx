'use client';

import { useMemo, useState } from 'react';
import { Bell, Bookmark, ChevronDown, Layers, RotateCcw, X } from 'lucide-react';
import { AlertSetupModal } from '@/components/alerts/AlertSetupModal';
import { AssetChart } from '@/components/chart/AssetChart';
import { Badge } from '@/components/common/Badge';
import { FormulaCandidateSheet } from '@/components/home/FormulaCandidateSheet';
import { MtsViewButton } from '@/components/mts/MtsViewButton';
import { useAppState } from '@/context/AppStateContext';
import { buildCardEvidenceLine, type FormulaCandidate, type FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';

function percent(value?: number | null) {
  if (value === null || value === undefined) return '데이터 기준';
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}

type StockCardFrontProps = {
  card: DisplayCard;
  formula: FormulaDefinition;
  candidates: FormulaCandidate[];
  onShowBack: () => void;
  onSkip?: () => void;
};

export function StockCardFront({ card, formula, candidates, onShowBack, onSkip }: StockCardFrontProps) {
  const { saveCard, hideCard, logEvent, showToast } = useAppState();
  const [alertFormula, setAlertFormula] = useState<FormulaDefinition | null>(null);
  const [candidateOpen, setCandidateOpen] = useState(false);
  const evidenceLine = useMemo(() => buildCardEvidenceLine(card), [card]);
  const criteria = formula.criteria.slice(0, 3);

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-[30px] bg-[#071426] p-5 text-white shadow-2xl shadow-slate-900/25">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap gap-2">
          <Badge>{card.marketLabel}</Badge>
          {card.theme ? <Badge tone="gray">{card.theme}</Badge> : null}
          <Badge tone="violet">{formula.cardLabel}</Badge>
        </div>
        <button
          type="button"
          onClick={() => {
            hideCard(card.id, { source: 'home_flip_front', market: card.market, symbol: card.symbol });
            onSkip?.();
          }}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-white/80"
          aria-label="넘기기"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-3xl font-black">{card.name}</h2>
          <p className="mt-1 text-sm font-bold text-blue-100">{card.symbol}</p>
        </div>
        <p className={(card.changePct ?? 0) < 0 ? 'text-3xl font-black text-blue-200' : 'text-3xl font-black text-red-200'}>{percent(card.changePct)}</p>
      </div>

      <div className="mt-4 overflow-hidden rounded-3xl bg-white p-1">
        <AssetChart compact market={card.market} assetKey={card.assetKey} tvSymbol={card.tvSymbol ?? undefined} coingeckoId={card.coingeckoId ?? undefined} />
      </div>

      <div className="mt-4 rounded-3xl bg-white/10 p-4">
        <p className="text-xs font-black text-blue-100">한 줄 근거</p>
        <p className="mt-2 text-base font-black leading-6 text-white">{evidenceLine}</p>
      </div>

      <div className="mt-3 rounded-3xl bg-white p-4 text-slate-950">
        <p className="text-xs font-black text-[#0B63F6]">추천 알림 조건식</p>
        <div className="mt-2 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-black">{formula.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-slate-500">{formula.description}</p>
          </div>
          <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-black text-[#0B63F6]">{formula.shortName}</span>
        </div>
        <div className="mt-3 grid gap-1.5">
          {criteria.map((item) => (
            <p key={item} className="flex items-start gap-2 text-xs font-bold leading-5 text-slate-700">
              <span className="mt-0.5 text-[#0B63F6]">✓</span>
              {item}
            </p>
          ))}
        </div>
        <p className="mt-2 text-xs font-semibold text-slate-400">유효기간 {formula.defaultExpiresInDays}일 · 조건 충족 참고 정보</p>
      </div>

      <div className="mt-auto space-y-2 pt-4">
        <button
          type="button"
          onClick={() => {
            logEvent('main_panel_alert_click', { cardKey: card.id, symbol: card.symbol, market: card.market, formulaKey: formula.key, evidenceLine });
            setAlertFormula(formula);
          }}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#0B63F6] text-base font-black text-white shadow-lg shadow-blue-500/25"
        >
          <Bell className="h-5 w-5" />
          이 조건 알림 받기
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              logEvent('formula_candidate_open', { cardKey: card.id, symbol: card.symbol, market: card.market });
              setCandidateOpen(true);
            }}
            className="flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-white/10 px-3 text-xs font-black text-white"
          >
            <Layers className="h-4 w-4" />
            다른 조건식
          </button>
          <button
            type="button"
            onClick={() => {
              saveCard(card.id, { source: 'home_flip_front', market: card.market, symbol: card.symbol, assetKey: card.assetKey });
              showToast('관심종목에 추가했습니다. 조건 알림은 따로 설정해야 합니다.');
            }}
            className="flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-white/10 px-3 text-xs font-black text-white"
          >
            <Bookmark className="h-4 w-4" />
            관심종목 추가
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onShowBack}
            className="flex h-11 items-center justify-center gap-1.5 rounded-2xl border border-white/15 bg-white/5 px-3 text-xs font-black text-blue-100"
          >
            <RotateCcw className="h-4 w-4" />
            뒷면에서 상세 보기
          </button>
          <MtsViewButton card={card} source="home" variant="secondary" label="MTS에서 보기" className="h-11 border-white/20 bg-white/10 text-xs text-white" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1 text-[11px] font-bold text-blue-100/70">
        <ChevronDown className="h-3.5 w-3.5" />
        위아래로 다른 종목을 봅니다
      </div>

      <AlertSetupModal card={card} formula={alertFormula ?? formula} open={Boolean(alertFormula)} onClose={() => setAlertFormula(null)} />
      <FormulaCandidateSheet
        open={candidateOpen}
        candidates={candidates}
        onClose={() => setCandidateOpen(false)}
        onSelect={(candidate) => {
          logEvent('formula_candidate_select', { cardKey: card.id, symbol: card.symbol, market: card.market, formulaKey: candidate.formula.key, fitScore: candidate.fitScore });
          setCandidateOpen(false);
          setAlertFormula(candidate.formula);
        }}
      />
    </section>
  );
}
