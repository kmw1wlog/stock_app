import { AdSlot } from './AdSlot';

export function NativeAdCard({ source }: { source: 'home' | 'explore' | 'results' | 'formula' }) {
  const slot = source === 'explore' ? process.env.NEXT_PUBLIC_ADSENSE_SLOT_EXPLORE : process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_FEED;
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="mb-3 text-xs font-black text-slate-400">Sponsored</p>
      <AdSlot slot={slot} />
    </section>
  );
}
