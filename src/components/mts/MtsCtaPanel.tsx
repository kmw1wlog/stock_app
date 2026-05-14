'use client';

import { ExternalLink } from 'lucide-react';
import { MtsViewButton } from '@/components/mts/MtsViewButton';
import { useAppState } from '@/context/AppStateContext';
import type { DisplayCard } from '@/lib/marketDataTypes';

export function MtsCtaPanel({ card }: { card: DisplayCard }) {
  const { logEvent } = useAppState();
  return (
    <section className="px-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-black text-[#0B63F6]">MTS CTA 실험</p>
        <h2 className="mt-1 text-xl font-black">이 종목을 증권앱에서 확인하기</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
          조건·수급·차트 정보를 확인한 뒤 원하는 MTS에서 차트와 호가를 이어서 볼 수 있습니다.
        </p>
        <div className="mt-4 grid gap-3">
          <button
            type="button"
            onClick={() => {
              logEvent('mts_cta_click', {
                cardKey: card.id,
                assetKey: card.assetKey,
                symbol: card.symbol,
                market: card.market,
                source: 'detail',
                providerCode: 'kb',
                isSponsored: true,
              });
              const params = new URLSearchParams({
                cardKey: card.id,
                assetKey: card.assetKey,
                symbol: card.symbol,
                name: card.name,
                source: 'detail',
                provider: 'kb',
              });
              window.setTimeout(() => window.location.assign(`/mts/select?${params.toString()}`), 0);
            }}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-black text-white shadow-lg shadow-slate-900/20"
          >
            KB증권에서 보기
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px]">제휴/광고</span>
            <ExternalLink className="h-5 w-5" />
          </button>
          <MtsViewButton card={card} source="detail" label="다른 MTS에서 보기" />
        </div>
        <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
          본 기능은 해당 종목 화면을 여는 기능이며, 매수·매도 추천이 아닙니다.
        </p>
      </div>
    </section>
  );
}
