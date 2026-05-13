import Link from 'next/link';
import { ChevronLeft, Database } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { MobileShell } from '@/components/layout/MobileShell';
import { exploreMeta, getExplorePayload, type ExploreSlug } from '@/lib/exploreLive';
import type { DisplayCard } from '@/lib/marketDataTypes';

const marketFilters = ['전체', '국장', '미장', '코인'];

export async function ExploreDetailPage({ slug }: { slug: ExploreSlug }) {
  const config = exploreMeta[slug];
  const payload = await getExplorePayload(slug);
  return (
    <MobileShell>
      <div className="space-y-5 py-6">
        <header className="flex items-start gap-3 px-5">
          <Link href="/explore" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white shadow-sm"><ChevronLeft className="h-7 w-7" /></Link>
          <div>
            <h1 className="text-3xl font-black tracking-normal">{config.title}</h1>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">공식 데이터 기준 목록입니다. 데이터가 없으면 준비중으로 표시합니다.</p>
          </div>
        </header>
        <section className="mx-5 rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-black text-slate-500">데이터 기준</p>
          <p className="mt-1 text-sm font-bold text-slate-700">{config.basis}</p>
          <div className="mt-3 flex flex-wrap gap-2">{config.sortOptions.map((option) => <Badge key={option} tone="blue">{option}</Badge>)}</div>
          <div className="mt-3 flex gap-2 overflow-x-auto">{marketFilters.map((filter, index) => <span key={filter} className={index === 0 ? 'shrink-0 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-black text-white' : 'shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-500'}>{filter}</span>)}</div>
        </section>
        <section className="space-y-3 px-5">
          {payload.items.length ? payload.items.map((card) => <DetailCard key={card.id} card={card} />) : <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center"><Database className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 text-sm font-bold text-slate-500">{payload.message ?? '데이터 준비중'}</p></div>}
        </section>
        <p className="px-6 text-xs font-semibold leading-5 text-slate-500">본 정보는 투자 판단을 돕기 위한 지표 기반 참고 정보이며, 투자 권유나 수익 보장을 의미하지 않습니다.</p>
      </div>
    </MobileShell>
  );
}

function DetailCard({ card }: { card: DisplayCard }) {
  return (
    <Link href={`/cards/${card.id}`} className="block rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black text-[#0B63F6]">{card.marketLabel} · {card.theme ?? card.source}</p>
          <h2 className="mt-1 truncate text-xl font-black">{card.name}</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{card.primaryReason}</p>
        </div>
        <span className={(card.changePct ?? 0) < 0 ? 'shrink-0 text-lg font-black text-blue-500' : 'shrink-0 text-lg font-black text-red-500'}>{card.changePct === undefined || card.changePct === null ? '위젯' : `${card.changePct > 0 ? '+' : ''}${card.changePct.toFixed(2)}%`}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">{(card.labels.length ? card.labels : [card.dataBasisLabel]).slice(0, 3).map((label) => <Badge key={label} tone="gray">{label}</Badge>)}</div>
    </Link>
  );
}
