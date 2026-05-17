'use client';

import { useEffect, useMemo, useState } from 'react';
import { NativeAdCard } from '@/components/ads/NativeAdCard';
import { StockSwipeStack } from '@/components/home/StockSwipeStack';
import { useAppState } from '@/context/AppStateContext';
import type { DisplayCard } from '@/lib/marketDataTypes';

export function VerticalStockFeed({ cards, allCards }: { cards: DisplayCard[]; allCards: DisplayCard[] }) {
  const { logEvent } = useAppState();
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    setVisibleCount(5);
  }, [cards]);

  const visibleCards = useMemo(() => cards.slice(0, visibleCount), [cards, visibleCount]);

  useEffect(() => {
    if (cards[0]) logEvent('vertical_feed_card_view', { cardKey: cards[0].id, symbol: cards[0].symbol, market: cards[0].market, positionIndex: 0 });
  }, [cards, logEvent]);

  if (!cards.length) {
    return (
      <div className="px-5 py-10">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-xl font-black">데이터 준비중</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            선택한 시장의 데이터 카드가 아직 없습니다. 탐색 탭에서 다른 시장이나 데이터 상태를 확인할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="hide-scrollbar h-[100dvh] overflow-y-auto"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 118px)',
      }}
    >
      {visibleCards.map((card, index) => (
        <div key={card.id}>
          <StockSwipeStack
            card={card}
            allCards={allCards}
            onSkip={() => logEvent('card_skip', { cardKey: card.id, symbol: card.symbol, market: card.market, positionIndex: index })}
          />
          {index > 0 && index % 5 === 0 ? <NativeAdCard source="home" slotName={`home_vertical_${index}`} title="제휴 콘텐츠" /> : null}
        </div>
      ))}
      {cards.length > visibleCount ? (
        <div className="px-5 pb-8 pt-2">
          <button
            type="button"
            onClick={() => setVisibleCount((current) => Math.min(current + 5, cards.length))}
            className="flex h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-700 shadow-sm"
          >
            카드 더 보기
          </button>
        </div>
      ) : null}
    </div>
  );
}
