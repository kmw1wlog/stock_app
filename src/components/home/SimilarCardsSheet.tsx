'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import type { DisplayCard } from '@/lib/marketDataTypes';

type SimilarCardsSheetProps = {
  open: boolean;
  sourceCard: DisplayCard;
  sameThemeCards: DisplayCard[];
  sameChartCards: DisplayCard[];
  onClose: () => void;
};

function ChangeLabel({ card }: { card: DisplayCard }) {
  const changePct = card.changePct;
  if (typeof changePct !== 'number') return <span className="text-[11px] font-bold text-slate-500">관찰</span>;
  const tone = changePct >= 0 ? 'text-rose-500' : 'text-blue-500';
  return <span className={`text-[11px] font-bold ${tone}`}>{`${changePct > 0 ? '+' : ''}${changePct.toFixed(1)}%`}</span>;
}

function CardGroup({
  title,
  sourceCard,
  cards,
}: {
  title: string;
  sourceCard: DisplayCard;
  cards: DisplayCard[];
}) {
  const { logEvent } = useAppState();

  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-black text-slate-500">{title}</p>
      <div className="space-y-2">
        {cards.length ? (
          cards.slice(0, 4).map((card) => (
            <Link
              key={card.id}
              href={`/cards/${card.id}`}
              onClick={() => logEvent('related_stock_click', { cardKey: sourceCard.id, targetCardKey: card.id, symbol: card.symbol, source: 'similar_cards_sheet' })}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-900">{card.name}</p>
                <p className="mt-1 text-[11px] font-semibold text-slate-500">{card.symbol} · {card.marketLabel}</p>
              </div>
              <ChangeLabel card={card} />
            </Link>
          ))
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-4 text-center text-xs font-semibold text-slate-500">
            아직 바로 보여줄 유사 종목이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}

export function SimilarCardsSheet({ open, sourceCard, sameThemeCards, sameChartCards, onClose }: SimilarCardsSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 px-4 pb-4">
      <section className="max-h-[82dvh] w-full max-w-[430px] overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black text-[#1D4ED8]">유사 보기</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">{sourceCard.name}와 비슷한 흐름</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100" aria-label="닫기">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
          같은 테마나 비슷한 흐름으로 묶이는 종목을 빠르게 비교할 수 있습니다.
        </p>

        <CardGroup title="같은 테마" sourceCard={sourceCard} cards={sameThemeCards} />
        <CardGroup title="비슷한 흐름" sourceCard={sourceCard} cards={sameChartCards} />
      </section>
    </div>
  );
}
