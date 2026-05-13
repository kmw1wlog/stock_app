import Link from 'next/link';
import { Bell, ChevronRight, Database, Search } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { MobileShell } from '@/components/layout/MobileShell';
import { exploreMeta, getExplorePayload, type ExploreSlug } from '@/lib/exploreLive';
import type { DisplayCard } from '@/lib/marketDataTypes';

const sections: ExploreSlug[] = ['movers', 'themes', 'news', 'flows', 'pullback', 'after-hours', 'maps'];

export default async function ExplorePage() {
  const payloads = await Promise.all(sections.map(async (slug) => ({ slug, payload: await getExplorePayload(slug) })));
  return (
    <MobileShell>
      <div className="space-y-6 py-6">
        <header className="flex items-center justify-between px-5">
          <div>
            <h1 className="text-3xl font-black">탐색</h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">공식 데이터 기준 섹션입니다. 데이터가 없으면 준비중으로 표시합니다.</p>
          </div>
          <div className="flex gap-3 text-slate-600"><Search className="h-6 w-6" /><Bell className="h-6 w-6" /></div>
        </header>
        {payloads.map(({ slug, payload }) => (
          <SectionShell key={slug} slug={slug} title={exploreMeta[slug].title} hint={exploreMeta[slug].basis}>
            {payload.items.length ? (
              <div className={slug === 'themes' ? 'hide-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5' : 'space-y-2'}>
                {payload.items.slice(0, slug === 'themes' ? 8 : 4).map((card) => <ExploreCard key={`${slug}-${card.id}`} card={card} compact={slug === 'themes'} />)}
              </div>
            ) : <EmptyState message={payload.message ?? '데이터 준비중'} />}
          </SectionShell>
        ))}
      </div>
    </MobileShell>
  );
}

function SectionShell({ slug, title, hint, children }: { slug: ExploreSlug; title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="px-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">{title}</h2>
          <p className="mt-1 text-xs font-black text-[#0B63F6]">{hint}</p>
        </div>
        <Link href={`/explore/${slug}`} className="flex shrink-0 items-center gap-1 text-sm font-black text-[#0B63F6]">더보기<ChevronRight className="h-4 w-4" /></Link>
      </div>
      {children}
    </section>
  );
}

function ExploreCard({ card, compact }: { card: DisplayCard; compact?: boolean }) {
  return (
    <Link href={`/cards/${card.id}`} className={compact ? 'block w-[170px] shrink-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm' : 'flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-sm'}>
      <div className="min-w-0">
        <div className="mb-1 flex gap-1"><Badge tone="blue">{card.marketLabel}</Badge>{card.theme ? <Badge tone="gray">{card.theme}</Badge> : null}</div>
        <p className="truncate text-base font-black">{card.name}</p>
        <p className="mt-1 line-clamp-2 text-xs font-bold leading-4 text-slate-500">{card.primaryReason}</p>
        <p className="mt-2 text-[11px] font-bold text-slate-400">{card.dataBasisLabel}</p>
      </div>
      {!compact ? <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" /> : null}
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="rounded-3xl border border-slate-200 bg-white p-5 text-center"><Database className="mx-auto h-7 w-7 text-slate-400" /><p className="mt-2 text-sm font-bold text-slate-500">{message}</p></div>;
}
