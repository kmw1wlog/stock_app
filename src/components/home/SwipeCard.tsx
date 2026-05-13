'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Info, Zap } from 'lucide-react';
import { AssetChart } from '@/components/chart/AssetChart';
import { Badge } from '@/components/common/Badge';
import type { StockCard } from '@/data/mockStocks';

type SwipeCardProps = {
  card: StockCard;
  index: number;
  total: number;
  nextCard?: StockCard;
  showDeck?: boolean;
  compact?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeCancel?: () => void;
  onTapDetail?: () => void;
};

const threshold = 92;

const fomoTone: Record<StockCard['fomoType'], 'blue' | 'green' | 'orange' | 'red' | 'violet'> = {
  missed_profit: 'orange',
  save_spike: 'blue',
  formula_copy: 'violet',
  chart_setup: 'green',
  community_heat: 'red',
  after_hours: 'orange',
  best_reaction: 'blue',
};

export function SwipeCard({ card, index, total, nextCard, showDeck, compact, onSwipeLeft, onSwipeRight, onSwipeCancel, onTapDetail }: SwipeCardProps) {
  const router = useRouter();
  const startX = useRef(0);
  const startY = useRef(0);
  const dragXRef = useRef(0);
  const suppressClickRef = useRef(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const rotation = dragX / 18;
  const absDrag = Math.abs(dragX);
  const feedback = dragX > 24 ? '관심' : dragX < -24 ? '넘기기' : null;

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    startX.current = event.clientX;
    startY.current = event.clientY;
    dragXRef.current = 0;
    suppressClickRef.current = false;
    setDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!dragging) {
      return;
    }
    const dx = event.clientX - startX.current;
    const dy = event.clientY - startY.current;
    if (Math.abs(dx) > Math.abs(dy) || Math.abs(dx) > 18) {
      const nextDragX = Math.max(-160, Math.min(160, dx));
      dragXRef.current = nextDragX;
      setDragX(nextDragX);
    }
  };

  const handlePointerUp = () => {
    if (!dragging) {
      return;
    }
    setDragging(false);
    const finalDragX = dragXRef.current;
    if (finalDragX <= -threshold) {
      suppressClickRef.current = true;
      setDragX(-430);
      window.setTimeout(() => {
        dragXRef.current = 0;
        setDragX(0);
        onSwipeLeft?.();
      }, 170);
      return;
    }
    if (finalDragX >= threshold) {
      suppressClickRef.current = true;
      setDragX(430);
      window.setTimeout(() => {
        dragXRef.current = 0;
        setDragX(0);
        onSwipeRight?.();
      }, 170);
      return;
    }
    if (Math.abs(finalDragX) > 12) {
      suppressClickRef.current = true;
      onSwipeCancel?.();
    }
    dragXRef.current = 0;
    setDragX(0);
  };

  const handleCardClick = (event: React.MouseEvent<HTMLElement>) => {
    if (suppressClickRef.current || Math.abs(dragXRef.current) > 8) {
      event.preventDefault();
      return;
    }
    onTapDetail?.();
    router.push(`/cards/${card.id}`);
  };

  const cardBody = (
    <article
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleCardClick}
      style={{
        transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
        transition: dragging ? 'none' : 'transform 180ms ease',
      }}
      className="relative touch-pan-y overflow-hidden rounded-[24px] bg-[#061A3D] text-white shadow-2xl shadow-blue-950/20"
    >
      {feedback ? (
        <div className={`pointer-events-none absolute left-5 top-5 z-10 rounded-full border-2 px-4 py-2 text-sm font-black ${dragX > 0 ? 'border-rose-300 bg-rose-500/20 text-rose-100' : 'border-slate-300 bg-slate-500/20 text-white'}`}>
          {feedback}
        </div>
      ) : null}
      <Link
        href={`/cards/${card.id}`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (absDrag > 8) {
            return;
          }
          onTapDetail?.();
          router.push(`/cards/${card.id}`);
        }}
        className="block"
      >
        <div className={compact ? 'relative p-4' : 'relative p-5'}>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge>{card.theme}</Badge>
            <Badge tone="gray">{card.market}</Badge>
            <Badge tone="violet">{card.style}</Badge>
          </div>
          <h2 className={compact ? 'text-[25px] font-black leading-tight tracking-normal' : 'text-[30px] font-black leading-tight tracking-normal'}>{card.name}</h2>
          <p className="mt-2 text-base font-black text-blue-100">{card.titleReason}</p>
          <p className="mt-1 line-clamp-2 text-sm font-medium leading-5 text-white/85">{card.subReason}</p>
          <div className={compact ? 'mt-3 overflow-hidden rounded-2xl bg-white' : 'mt-4 overflow-hidden rounded-3xl bg-white'}>
            <AssetChart market={card.marketType} assetKey={card.id} tvSymbol={card.tvSymbol} coingeckoId={card.coingeckoId} compact />
          </div>
          <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-2xl border border-white/15 bg-white/12 backdrop-blur-xl">
            <Stat label={card.marketType === 'US' ? '가격·차트' : '거래대금'} value={card.volumeAmountText} />
            <Stat label="등락/라벨" value={card.marketType === 'US' ? '위젯' : `${card.priceChangeRate > 0 ? '+' : ''}${card.priceChangeRate}%`} highlight />
            <Stat label="위험도" value={card.riskLevel} />
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

      <div className="px-5 pb-4">
        <div className="rounded-2xl bg-white p-3 text-slate-950 shadow-xl">
          <div className="mb-1 flex items-center justify-between gap-3">
            <Badge tone={fomoTone[card.fomoType]}>{card.fomoMetric ?? '기회 포착'}</Badge>
            <Zap className="h-5 w-5 text-[#0B63F6]" />
          </div>
          <h3 className="line-clamp-2 text-base font-black leading-6">{card.fomoHeadline}</h3>
          <p className="mt-1 text-[11px] font-bold text-slate-400">기준: {card.sourceLabel ?? card.dataBasisLabel}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-[#0B63F6]">{card.fomoCta ?? '지금 확인'}</span>
            <ChevronRight className="h-5 w-5 text-slate-400" />
          </div>
        </div>
        <Link href={`/cards/${card.id}`} className="mt-3 flex items-center justify-between border-t border-white/15 pt-3 text-xs font-bold text-blue-100">
          <span className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            진단 · 차트자리 · 조건식
          </span>
          <ChevronRight className="h-5 w-5" />
        </Link>
        <div className="mt-3 flex justify-center gap-2">
          {Array.from({ length: total }).map((_, dotIndex) => (
            <span key={dotIndex} className={dotIndex === index ? 'h-2 w-6 rounded-full bg-[#0B63F6]' : 'h-2 w-2 rounded-full bg-slate-300'} />
          ))}
        </div>
      </div>
    </article>
  );

  if (!showDeck || !nextCard) {
    return cardBody;
  }

  return (
    <div className="relative">
      <div className="absolute inset-x-4 top-4 -z-0 scale-[0.96] overflow-hidden rounded-[24px] bg-slate-300 opacity-80">
        <div className="h-[430px]" />
      </div>
      <div className="relative z-10">{cardBody}</div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="border-r border-white/15 p-2.5 last:border-r-0">
      <p className="text-[10px] text-blue-100">{label}</p>
      <p className={highlight ? 'text-base font-black text-emerald-300' : 'text-base font-black'}>{value}</p>
    </div>
  );
}
