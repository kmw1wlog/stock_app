'use client';

import { Bell, X } from 'lucide-react';
import type { FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';
import { createConditionAlert } from '@/lib/user/userConditionAlerts';
import { useAppState } from '@/context/AppStateContext';

type AlertSetupModalProps = {
  card: DisplayCard;
  formula: FormulaDefinition;
  open: boolean;
  onClose: () => void;
};

export function AlertSetupModal({ card, formula, open, onClose }: AlertSetupModalProps) {
  const { showToast, logEvent } = useAppState();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 px-4 pb-4">
      <section className="w-full max-w-[430px] rounded-[28px] bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black text-[#0B63F6]">조건식 알림 설정</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">이 조건 알림 받기</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100" aria-label="닫기">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm font-bold text-slate-700">
            {card.name}에서 <span className="text-[#0B63F6]">{formula.name}</span> 조건이 다시 발생하면 알려드립니다.
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-600">알림 유효기간: {formula.defaultExpiresInDays}일</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">만료 전 다시 확인하고 연장할 수 있습니다.</p>
        </div>
        <p className="mt-4 text-xs font-semibold leading-5 text-slate-500">본 알림은 매수·매도 추천이 아닙니다. 조건 충족 사실을 알려주는 참고 기능입니다.</p>
        <button
          type="button"
          className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#0B63F6] text-base font-black text-white shadow-lg shadow-blue-500/25"
          onClick={async () => {
            try {
              const alert = await createConditionAlert(card, formula);
              logEvent('condition_alert_create', { cardKey: card.id, assetKey: card.assetKey, symbol: card.symbol, market: card.market, formulaKey: formula.key, alertId: alert.id });
              showToast('조건식 알림을 설정했습니다.');
              onClose();
            } catch {
              showToast('알림 설정에 실패했습니다.');
            }
          }}
        >
          <Bell className="h-5 w-5" />
          알림 받기
        </button>
      </section>
    </div>
  );
}
