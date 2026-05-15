import { AdSlot } from './AdSlot';

type NativeAdCardProps = {
  source: 'home' | 'explore' | 'results' | 'formula' | 'detail' | 'mts' | 'saved' | 'rankings' | 'report';
  slotName?: string;
  title?: string;
  description?: string;
};

export function NativeAdCard({ source, slotName, title, description }: NativeAdCardProps) {
  const slot = source === 'explore' ? process.env.NEXT_PUBLIC_ADSENSE_SLOT_EXPLORE : process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_FEED;
  return (
    <section className="mx-5 rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
      <p className="mb-2 text-xs font-black text-amber-700">광고 / Sponsored</p>
      <h3 className="text-lg font-black text-slate-950">{title ?? '제휴 콘텐츠'}</h3>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
        {description ?? '이 콘텐츠는 광고주가 비용을 지불한 홍보 콘텐츠입니다.'}
      </p>
      <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
        앱의 조건식 후보 선정 및 알림 결과와 무관합니다.
      </p>
      {source === 'mts' ? (
        <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
          제휴/광고에 따라 일부 증권앱이 상단에 노출될 수 있습니다. 사용자는 원하는 MTS를 직접 선택할 수 있습니다.
        </p>
      ) : null}
      <AdSlot slot={slotName ?? slot} className="mt-4" />
    </section>
  );
}
