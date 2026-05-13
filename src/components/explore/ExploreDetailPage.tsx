import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { MobileShell } from '@/components/layout/MobileShell';
import { exploreConfig, getExploreCards, type ExploreSlug } from '@/lib/explore/exploreData';

export function ExploreDetailPage({ slug }: { slug: ExploreSlug }) {
  const config = exploreConfig[slug];
  const cards = getExploreCards(slug);

  return (
    <MobileShell>
      <div className="space-y-5 py-6">
        <header className="flex items-start gap-3 px-5">
          <Link href="/explore" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white shadow-sm">
            <ChevronLeft className="h-7 w-7" />
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-normal">{config.title}</h1>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{config.description}</p>
          </div>
        </header>
        <section className="mx-5 rounded-3xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-black text-slate-500">데이터 기준</p>
          <p className="mt-1 text-sm font-bold text-slate-700">{config.basis}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {config.sortOptions.map((option) => (
              <Badge key={option} tone="blue">
                {option}
              </Badge>
            ))}
          </div>
        </section>
        <section className="space-y-3 px-5">
          {cards.map((card) => (
            <Link key={card.id} href={`/cards/${card.id}`} className="block rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-black text-[#0B63F6]">{card.market} · {card.theme}</p>
                  <h2 className="mt-1 truncate text-xl font-black">{card.name}</h2>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{card.chartSetupType}</p>
                </div>
                <span className={card.priceChangeRate >= 0 ? 'shrink-0 text-lg font-black text-red-500' : 'shrink-0 text-lg font-black text-blue-500'}>
                  {card.marketType === 'US' ? '위젯' : `${card.priceChangeRate > 0 ? '+' : ''}${card.priceChangeRate}%`}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {card.coreLabels.slice(0, 3).map((label) => (
                  <Badge key={label} tone="gray">
                    {label}
                  </Badge>
                ))}
              </div>
            </Link>
          ))}
        </section>
        <p className="px-6 text-xs font-semibold leading-5 text-slate-500">
          본 정보는 투자 판단을 돕기 위한 지표 기반 참고 정보이며, 투자 권유나 수익 보장을 의미하지 않습니다.
        </p>
      </div>
    </MobileShell>
  );
}
