'use client';

import Link from 'next/link';
import { ChevronRight, Info, Zap } from 'lucide-react';
import { AssetChart } from '@/components/chart/AssetChart';
import { Badge } from '@/components/common/Badge';
import type { StockCard } from '@/data/mockStocks';

type SwipeCardProps = {
  card: StockCard;
  index: number;
  total: number;
};

const fomoTone: Record<StockCard['fomoType'], 'blue' | 'green' | 'orange' | 'red' | 'violet'> = {
  missed_profit: 'orange',
  save_spike: 'blue',
  formula_copy: 'violet',
  chart_seat: 'green',
  community_heat: 'red',
  after_hours: 'orange',
  best_reaction: 'blue',
};

export function SwipeCard({ card, index, total }: SwipeCardProps) {
  return (
    <section className="overflow-hidden rounded-[28px] bg-[#061A3D] text-white shadow-2xl shadow-blue-950/20">
      <Link href={`/cards/${card.id}`} className="block">
        <div className="relative p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge>{card.theme}</Badge>
            <Badge tone="gray">{card.market}</Badge>
            <Badge tone="violet">{card.style}</Badge>
          </div>
          <h2 className="text-[30px] font-black leading-tight tracking-[-0.02em]">{card.name}</h2>
          <p className="mt-3 text-lg font-black text-blue-100">{card.titleReason}</p>
          <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-white/85">{card.subReason}</p>
          <div className="mt-4 overflow-hidden rounded-3xl bg-white">
            <AssetChart market={card.marketType} tvSymbol={card.tvSymbol} coingeckoId={card.coingeckoId} compact />
          </div>
          <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-2xl border border-white/15 bg-white/12 backdrop-blur-xl">
            <div className="border-r border-white/15 p-3">
              <p className="text-[11px] text-blue-100">{card.marketType === 'US' ? '가격/차트' : '거래대금'}</p>
              <p className="text-lg font-black">{card.volumeAmountText}</p>
            </div>
            <div className="border-r border-white/15 p-3">
              <p className="text-[11px] text-blue-100">등락/라벨</p>
              <p className="text-lg font-black text-emerald-300">{card.marketType === 'US' ? '위젯' : `${card.priceChangeRate > 0 ? '+' : ''}${card.priceChangeRate}%`}</p>
            </div>
            <div className="p-3">
              <p className="text-[11px] text-blue-100">위험도</p>
              <p className="text-lg font-black text-amber-300">{card.riskLevel}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {card.coreLabels.slice(0, 3).map((label) => (
              <span key={label} className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-black text-blue-100">
                {label}
              </span>
            ))}
          </div>
        </div>
      </Link>

      <div className="px-5 pb-5">
        <div className="rounded-3xl bg-white p-4 text-slate-950 shadow-xl">
          <div className="mb-2 flex items-center justify-between gap-3">
            <Badge tone={fomoTone[card.fomoType]}>{card.fomoMetric ?? '기회 포착'}</Badge>
            <Zap className="h-5 w-5 text-[#0B63F6]" />
          </div>
          <h3 className="text-lg font-black leading-6">{card.fomoHeadline}</h3>
          <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-600">{card.fomoSubtext}</p>
          {card.sourceLabel ? <p className="mt-2 text-[11px] font-bold text-slate-400">기준: {card.sourceLabel}</p> : null}
          <p className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-500">{card.dataBasisLabel}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="rounded-full bg-blue-50 px-3 py-2 text-xs font-black text-[#0B63F6]">{card.fomoCta ?? '지금 확인'}</span>
            <ChevronRight className="h-5 w-5 text-slate-400" />
          </div>
        </div>
        <Link href={`/cards/${card.id}`} className="mt-4 flex items-center justify-between border-t border-white/15 pt-4 text-sm font-bold text-blue-100">
          <span className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            조건식 복사 · 상세 보기에서 가능
          </span>
          <ChevronRight className="h-5 w-5" />
        </Link>
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: total }).map((_, dotIndex) => (
            <span key={dotIndex} className={dotIndex === index ? 'h-2 w-6 rounded-full bg-[#0B63F6]' : 'h-2 w-2 rounded-full bg-slate-300'} />
          ))}
        </div>
      </div>
    </section>
  );
}
