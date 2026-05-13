'use client';

import { useEffect } from 'react';
import { Filter, TrendingUp } from 'lucide-react';
import { PremiumLockCard } from '@/components/common/PremiumLockCard';
import { Sparkline } from '@/components/common/Sparkline';
import { MobileShell } from '@/components/layout/MobileShell';
import { ResultTrackingCard } from '@/components/results/ResultTrackingCard';
import { useAppState } from '@/context/AppStateContext';
import { bestResults, resultByCardId } from '@/data/mockResults';
import { getStockCard } from '@/data/mockStocks';

export default function ResultsPage() {
  const { state, showToast, logEvent } = useAppState();
  const trackingIds = state.trackingCardIds.length ? state.trackingCardIds : ['rainbow-robotics', 'isupetasys', 'alteogen'];
  const visibleIds = Array.from(new Set([...trackingIds, 'cmes', 'ecopro']));

  useEffect(() => {
    logEvent('result_view');
  }, [logEvent]);

  return (
    <MobileShell>
      <div className="space-y-5 py-6">
        <header className="flex items-start justify-between px-5">
          <div className="flex gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#0B63F6] text-white shadow-lg shadow-blue-500/30">
              <TrendingUp className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-[-0.03em]">결과</h1>
              <p className="mt-2 text-sm font-semibold text-slate-500">저장한 카드와 놓친 카드의 이후 반응을 확인하세요.</p>
            </div>
          </div>
          <button className="flex h-12 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black">
            <Filter className="h-5 w-5" />
            필터
          </button>
        </header>
        <div className="mx-5 grid grid-cols-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <button className="bg-[#0B63F6] py-4 text-xs font-black text-white">가상추적</button>
          <button className="py-4 text-xs font-black text-red-500">놓친 카드</button>
          <button className="py-4 text-xs font-black text-slate-500">반응 구간</button>
          <button className="py-4 text-xs font-black text-slate-500">BEST 반응</button>
        </div>
        <section className="mx-5 flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <p className="text-xl font-black">이번 주 추적 중인 카드 <span className="text-[#0B63F6]">{trackingIds.length}개</span></p>
            <p className="mt-2 text-sm font-bold text-slate-500">저장 카드 평균 반응 <span className="text-emerald-600">+1.28%</span></p>
          </div>
          <Sparkline />
        </section>
        <section className="mx-5 rounded-3xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm font-black text-orange-500">BEST 반응 TOP 3</p>
          <div className="grid grid-cols-3 gap-2">
            {bestResults.map((item, index) => (
              <div key={item.name} className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs font-black text-slate-500">{index + 1}</p>
                <p className="truncate text-sm font-black">{item.name}</p>
                <p className="text-sm font-black text-[#0B63F6]">+{item.rate}%</p>
              </div>
            ))}
          </div>
        </section>
        <div className="px-5">
          <PremiumLockCard source="results_best_top3" />
        </div>
        <section className="space-y-3 px-5">
          {visibleIds.map((id) => <ResultTrackingCard key={id} card={getStockCard(id)} result={resultByCardId[id]} />)}
        </section>
        <button onClick={() => { logEvent('result_update_click'); showToast('3일 전 저장한 카드 결과를 업데이트했습니다.'); }} className="mx-5 flex w-[calc(100%-40px)] items-center justify-between rounded-2xl border border-blue-200 bg-blue-50 p-4 text-left text-base font-black text-[#0B63F6]">
          3일 전 저장한 카드 결과 업데이트
          <span className="rounded-xl bg-[#0B63F6] px-4 py-3 text-sm text-white">결과 보기</span>
        </button>
        <p className="px-6 text-xs font-semibold leading-5 text-slate-500">가상추적 결과는 모의 기준이며 실제 체결, 수수료, 슬리피지에 따라 달라질 수 있습니다.</p>
      </div>
    </MobileShell>
  );
}
