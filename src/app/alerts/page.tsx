'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bell, Clock, Pause, RefreshCw } from 'lucide-react';
import { MobileShell } from '@/components/layout/MobileShell';
import { useAppState } from '@/context/AppStateContext';
import { extendConditionAlert, fetchConditionAlerts, pauseConditionAlert, type ConditionAlertDto } from '@/lib/user/userConditionAlerts';

function formatDate(value?: string | null) {
  if (!value) return '만료일 없음';
  return new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric' }).format(new Date(value));
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<ConditionAlertDto[]>([]);
  const { anonymousId, showToast, logEvent } = useAppState();

  useEffect(() => {
    if (!anonymousId) return;
    fetchConditionAlerts(anonymousId).then(setAlerts);
  }, [anonymousId]);

  const active = useMemo(() => alerts.filter((alert) => alert.status === 'active'), [alerts]);
  const expiring = active.filter((alert) => alert.expiresAt && new Date(alert.expiresAt).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000);

  return (
    <MobileShell>
      <div className="space-y-5 px-5 py-6">
        <header>
          <p className="text-xs font-black text-[#0B63F6]">조건식 알림</p>
          <h1 className="mt-2 text-3xl font-black">내 조건식 알림</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">조건이 다시 발생할 때 확인할 종목과 조건식을 관리합니다.</p>
        </header>

        <section className="grid grid-cols-3 gap-2">
          <Metric label="활성" value={`${active.length}`} />
          <Metric label="만료 예정" value={`${expiring.length}`} />
          <Metric label="최근 발생" value={`${alerts.filter((alert) => alert.lastTriggeredAt).length}`} />
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-black">활성 알림</h2>
          {active.length ? active.map((alert) => (
            <div key={alert.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-[#0B63F6]"><Bell className="h-6 w-6" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-black">{String(alert.metadata?.cardName ?? alert.symbol ?? alert.cardKey)}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{alert.formulaName}</p>
                  <p className="mt-2 flex items-center gap-1 text-xs font-bold text-slate-500"><Clock className="h-4 w-4" /> 만료일 {formatDate(alert.expiresAt)}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#0B63F6] text-sm font-black text-white"
                  onClick={async () => {
                    await extendConditionAlert(alert.id, 7);
                    logEvent('condition_alert_extend', { alertId: alert.id, cardKey: alert.cardKey, formulaKey: alert.formulaKey });
                    showToast('알림을 7일 연장했습니다.');
                    if (anonymousId) setAlerts(await fetchConditionAlerts(anonymousId));
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                  연장
                </button>
                <button
                  type="button"
                  className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-700"
                  onClick={async () => {
                    await pauseConditionAlert(alert.id);
                    logEvent('condition_alert_cancel', { alertId: alert.id, cardKey: alert.cardKey, formulaKey: alert.formulaKey });
                    showToast('알림을 껐습니다.');
                    setAlerts((current) => current.map((item) => item.id === alert.id ? { ...item, status: 'paused' } : item));
                  }}
                >
                  <Pause className="h-4 w-4" />
                  끄기
                </button>
              </div>
            </div>
          )) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-sm font-bold text-slate-500">아직 설정한 조건식 알림이 없습니다.</div>
          )}
        </section>

        <p className="text-xs font-semibold leading-5 text-slate-500">본 알림은 조건 충족 사실을 알려주는 참고 기능이며, 매수·매도 추천이 아닙니다.</p>
      </div>
    </MobileShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-[#0B63F6]">{value}</p>
    </div>
  );
}
