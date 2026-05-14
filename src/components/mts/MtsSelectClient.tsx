'use client';

import { useMemo } from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { NativeAdCard } from '@/components/ads/NativeAdCard';
import { Badge } from '@/components/common/Badge';
import { MobileShell } from '@/components/layout/MobileShell';
import { useAppState } from '@/context/AppStateContext';
import { buildMtsUrl, sortedMtsProviders } from '@/lib/mts/providers';

export function MtsSelectClient() {
  const searchParams = useSearchParams();
  const { logEvent } = useAppState();
  const cardKey = searchParams.get('cardKey') ?? '';
  const assetKey = searchParams.get('assetKey') ?? '';
  const symbol = searchParams.get('symbol') ?? '';
  const name = searchParams.get('name') ?? symbol;
  const source = searchParams.get('source') ?? 'detail';
  const providers = useMemo(() => sortedMtsProviders(), []);

  const sponsored = providers.filter((provider) => provider.isSponsored);
  const regular = providers.filter((provider) => !provider.isSponsored);

  const openProvider = (providerCode: string, positionIndex: number) => {
    const provider = providers.find((item) => item.code === providerCode);
    if (!provider) return;
    logEvent('mts_provider_select', {
      providerCode: provider.code,
      providerName: provider.displayName,
      cardKey,
      assetKey,
      symbol,
      source,
      isSponsored: Boolean(provider.isSponsored),
      positionIndex,
    });
    logEvent('mts_deeplink_attempt', {
      providerCode: provider.code,
      cardKey,
      assetKey,
      symbol,
      source,
    });
    window.location.href = buildMtsUrl(provider, symbol);
  };

  return (
    <MobileShell>
      <div className="space-y-5 py-6">
        <header className="px-5">
          <p className="text-xs font-black text-[#0B63F6]">MTS 연결</p>
          <h1 className="mt-1 text-3xl font-black tracking-normal">이 종목을 증권앱에서 확인하기</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            {name} {symbol ? `(${symbol})` : ''} 정보를 원하는 증권앱에서 직접 확인할 수 있습니다.
          </p>
        </header>

        <NativeAdCard source="mts" slotName="mts_selector_top" title="제휴 증권앱" description="관심 종목을 사용 중인 MTS에서 확인할 수 있습니다." />

        {sponsored.length ? (
          <section className="space-y-3 px-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">제휴/광고</h2>
              <Badge tone="blue">Sponsored</Badge>
            </div>
            {sponsored.map((provider, index) => (
              <button
                key={provider.code}
                onClick={() => openProvider(provider.code, index)}
                className="flex w-full items-center justify-between rounded-3xl border border-blue-200 bg-blue-50 p-4 text-left shadow-sm"
              >
                <div>
                  <p className="text-lg font-black text-slate-950">{provider.displayName}에서 보기</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">{provider.disclosure ?? '제휴/광고'}</p>
                </div>
                <ExternalLink className="h-5 w-5 text-[#0B63F6]" />
              </button>
            ))}
          </section>
        ) : null}

        <section className="space-y-3 px-5">
          <h2 className="text-lg font-black">다른 MTS</h2>
          <div className="space-y-2">
            {regular.map((provider, index) => (
              <button
                key={provider.code}
                onClick={() => openProvider(provider.code, sponsored.length + index)}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm"
              >
                <span className="text-base font-black text-slate-950">{provider.displayName}</span>
                <ExternalLink className="h-5 w-5 text-slate-400" />
              </button>
            ))}
          </div>
        </section>

        <section className="mx-5 rounded-3xl border border-slate-200 bg-white p-4">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#0B63F6]" />
            <p className="text-xs font-semibold leading-5 text-slate-500">
              일부 증권앱은 제휴/광고에 따라 상단에 노출될 수 있습니다. 사용자는 원하는 MTS를 직접 선택할 수 있습니다. 본 기능은 해당 종목 화면을 여는 기능이며, 매수·매도 추천이 아닙니다.
            </p>
          </div>
        </section>

        <NativeAdCard source="mts" slotName="mts_selector_bottom" />
      </div>
    </MobileShell>
  );
}
