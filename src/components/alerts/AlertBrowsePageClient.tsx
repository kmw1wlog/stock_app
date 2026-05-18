'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Bell, CheckCircle2 } from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { alertEngineCatalog, pickRecommendedAlertEngine } from '@/lib/cards/alertEngineCatalog';

export function AlertBrowsePageClient() {
  const searchParams = useSearchParams();
  const { logEvent, showToast } = useAppState();
  const formulaKey = searchParams.get('formulaKey') ?? 'chart_setup_detected';
  const symbol = searchParams.get('symbol') ?? '';
  const cardKey = searchParams.get('cardKey') ?? '';
  const recommended = useMemo(() => pickRecommendedAlertEngine(formulaKey), [formulaKey]);

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-5 pb-28 pt-6">
      <header className="rounded-[30px] bg-[linear-gradient(180deg,#09244A_0%,#071A3A_100%)] p-5 text-white shadow-[0_16px_32px_rgba(8,27,56,0.14)]">
        <p className="text-xs font-black text-blue-100">자체 알람 엔진</p>
        <h1 className="mt-2 text-3xl font-black">알람 둘러보기</h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-blue-50/90">
          국장 1분봉 런타임 엔진에서 쓰는 A-O 알람을 한곳에서 봅니다. {symbol ? `${symbol} 카드에서 추천된 알람을 먼저 강조했습니다.` : '카드에서 진입하면 추천 알람이 강조됩니다.'}
        </p>
      </header>

      <section className="mt-5 rounded-[28px] border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#0B63F6] text-sm font-black text-white">{recommended.code}</span>
          <div className="min-w-0">
            <p className="text-xs font-black text-blue-700">현재 추천 알람</p>
            <h2 className="mt-1 text-xl font-black text-slate-950">{recommended.name}</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{recommended.summary}</p>
            <p className="mt-2 text-xs font-black text-slate-500">{recommended.easyRule}</p>
          </div>
        </div>
      </section>

      <div className="mt-5 grid grid-cols-1 gap-3">
        {alertEngineCatalog.map((engine) => {
          const active = engine.key === recommended.key;
          return (
            <button
              key={engine.key}
              type="button"
              onClick={() => {
                logEvent('alert_engine_card_click', { cardKey, symbol, alertEngineKey: engine.key, alertEngineCode: engine.code, source: 'alert_browse_page' });
                logEvent('alert_engine_select', { cardKey, symbol, alertEngineKey: engine.key, alertEngineCode: engine.code, source: 'alert_browse_page' });
                showToast(`${engine.name} 알람을 확인했습니다.`);
              }}
              className={`rounded-[24px] border px-4 py-4 text-left shadow-sm ${active ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'}`}
            >
              <div className="flex items-start gap-3">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-black ${active ? 'bg-[#0B63F6] text-white' : 'bg-slate-950 text-white'}`}>{engine.code}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-base font-black text-slate-950">{engine.name}</p>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black ${active ? 'bg-white text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                      {active ? '추천' : '국장'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold leading-5 text-slate-600">{engine.summary}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="truncate text-[12px] font-bold text-slate-500">{engine.easyRule}</p>
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

      <p className="mt-5 rounded-2xl bg-white px-4 py-3 text-xs font-semibold leading-5 text-slate-500">
        알람은 매수·매도 추천이 아니라 조건 감지용 참고 신호입니다. KIS 실시간 worker와 DB 영구 저장은 별도 서버 단계에서 연결합니다.
      </p>
    </div>
  );
}
