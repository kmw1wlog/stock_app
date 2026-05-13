'use client';

import { useEffect } from 'react';
import { BellRing, ChevronRight, Eye, RotateCcw, ScrollText, Target, TrendingUp } from 'lucide-react';
import { PremiumLockCard } from '@/components/common/PremiumLockCard';
import { MobileShell } from '@/components/layout/MobileShell';
import { useAppState } from '@/context/AppStateContext';
import { opportunityReport } from '@/data/mockDiagnosis';

export default function DiagnosisPage() {
  const { showToast, logEvent } = useAppState();

  useEffect(() => {
    logEvent('result_view', { source: 'opportunity_report' });
  }, [logEvent]);

  const handleAction = (eventName: string, cta: string) => {
    logEvent(eventName, { source: 'opportunity_report', cta });
    showToast(`${cta} 요청을 기록했습니다.`);
  };

  return (
    <MobileShell>
      <div className="space-y-5 py-6">
        <header className="flex items-start justify-between px-5">
          <div>
            <h1 className="text-4xl font-black tracking-normal">기회 리포트</h1>
            <p className="mt-2 max-w-[300px] text-sm font-semibold leading-6 text-slate-500">저장하거나 넘긴 카드가 이후 어떻게 다시 확인됐는지 정리합니다.</p>
          </div>
          <div className="w-20 rounded-2xl border border-blue-200 bg-white p-2 text-center">
            <p className="text-[11px] font-black text-slate-500">놓친 카드</p>
            <p className="text-3xl font-black text-[#0B63F6]">6</p>
          </div>
        </header>

        <section className="mx-5 rounded-[28px] deep-card p-6 text-white shadow-xl shadow-blue-950/20">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-blue-100">기회 포착</span>
            <BellRing className="h-6 w-6 text-blue-200" />
          </div>
          <h2 className="text-3xl font-black leading-tight">{opportunityReport.title}</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-blue-100">{opportunityReport.subtitle}</p>
          <div className="mt-5 space-y-3">
            {opportunityReport.bullets.map((bullet) => (
              <p key={bullet} className="flex gap-3 text-sm font-semibold leading-6 text-white/90">
                <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-blue-300" />
                {bullet}
              </p>
            ))}
          </div>
          <button
            onClick={() => handleAction('missed_card_click', '놓친 카드 다시 보기')}
            className="mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-black text-[#0B63F6]"
          >
            놓친 카드 다시 보기
            <ChevronRight className="h-5 w-5" />
          </button>
        </section>

        <section className="grid grid-cols-3 gap-3 px-5">
          {opportunityReport.metrics.map((metric, index) => (
            <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
              <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-blue-50 text-[#0B63F6]">
                {index === 0 ? <Eye /> : index === 1 ? <Target /> : <ScrollText />}
              </div>
              <p className="text-xs font-black text-slate-500">{metric.label}</p>
              <p className="mt-2 text-2xl font-black text-[#0B63F6]">{metric.value}</p>
              <p className="mt-1 text-[11px] font-bold text-slate-400">{metric.sub}</p>
            </div>
          ))}
        </section>

        <section className="px-5">
          <h2 className="mb-3 text-xl font-black">지금 확인할 기회</h2>
          <div className="space-y-3">
            {opportunityReport.actions.map((action, index) => (
              <button
                key={action.title}
                onClick={() => handleAction(action.eventName, action.cta)}
                className="flex w-full items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 text-left shadow-sm"
              >
                <span className={index === 0 ? 'grid h-12 w-12 shrink-0 place-items-center rounded-full bg-orange-50 text-orange-500' : 'grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blue-50 text-[#0B63F6]'}>
                  {index === 0 ? <RotateCcw /> : index === 1 ? <Target /> : <ScrollText />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-black text-slate-950">{action.title}</span>
                  <span className="mt-1 block text-sm font-semibold leading-6 text-slate-600">{action.description}</span>
                </span>
                <span className="rounded-xl bg-[#0B63F6] px-3 py-2 text-xs font-black text-white">{action.cta}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="mx-5 rounded-3xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-lg font-black text-slate-950">{opportunityReport.bestStimulus.title}</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{opportunityReport.bestStimulus.subtitle}</p>
        </section>

        <div className="px-5">
          <PremiumLockCard source="opportunity_report_bottom" />
        </div>
        <p className="px-6 text-xs font-semibold leading-5 text-slate-500">
          가상추적 결과는 기준 시점 이후 가격 변화를 단순 계산한 참고 정보입니다. 실제 체결, 수수료, 슬리피지에 따라 달라질 수 있습니다.
        </p>
      </div>
    </MobileShell>
  );
}
