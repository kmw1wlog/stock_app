import { Bookmark, ChevronLeft, Share2 } from 'lucide-react';
import Link from 'next/link';
import { AssetChart } from '@/components/chart/AssetChart';
import { Badge } from '@/components/common/Badge';
import type { StockCard } from '@/data/mockStocks';

export function CardHero({ card }: { card: StockCard }) {
  return (
    <>
      <header className="flex items-center justify-between px-5 pb-4 pt-5">
        <Link href="/" className="grid h-10 w-10 place-items-center rounded-full bg-white">
          <ChevronLeft className="h-7 w-7" />
        </Link>
        <div className="text-center">
          <p className="text-xs font-bold text-slate-500">카드 상세 · 종목 진단</p>
          <h1 className="text-lg font-black">{card.name}</h1>
        </div>
        <div className="flex gap-2">
          <Bookmark className="h-6 w-6 text-slate-700" />
          <Share2 className="h-6 w-6 text-slate-700" />
        </div>
      </header>
      <section className="mx-5 overflow-hidden rounded-[28px] deep-card p-5 text-white shadow-xl shadow-blue-950/20">
        <div className="flex flex-wrap gap-2">
          <Badge>{card.theme}</Badge>
          <Badge tone="gray">{card.market}</Badge>
          <Badge tone="violet">{card.style}</Badge>
          <Badge tone={card.riskLevel === '높음' ? 'orange' : 'blue'}>위험도 {card.riskLevel}</Badge>
          <Badge tone="blue">{card.fomoMetric}</Badge>
        </div>
        <h2 className="mt-5 text-3xl font-black">{card.name}</h2>
        <p className="mt-3 text-xl font-black text-blue-100">{card.titleReason}</p>
        <p className="mt-2 text-sm font-semibold text-white/80">{card.subReason}</p>
        <div className="mt-5 overflow-hidden rounded-2xl bg-white p-1">
          <AssetChart market={card.marketType} assetKey={card.id} tvSymbol={card.tvSymbol} coingeckoId={card.coingeckoId} />
        </div>
        <p className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-black text-blue-100">{card.dataBasisLabel}</p>
      </section>
    </>
  );
}
