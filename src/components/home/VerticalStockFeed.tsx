'use client';

import { useEffect } from 'react';
import { NativeAdCard } from '@/components/ads/NativeAdCard';
import { StockSwipeStack } from '@/components/home/StockSwipeStack';
import { useAppState } from '@/context/AppStateContext';
import type { DisplayCard } from '@/lib/marketDataTypes';

export function VerticalStockFeed({ cards, allCards }: { cards: DisplayCard[]; allCards: DisplayCard[] }) {
  const { logEvent } = useAppState();

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
    <div className="hide-scrollbar h-[calc(100dvh-138px)] overflow-y-auto scroll-smooth pb-28 [scroll-snap-type:y_proximity]">
      {cards.map((card, index) => (
        <div key={card.id}>
          <StockSwipeStack
            card={card}
            allCards={allCards}
            onSkip={() => logEvent('card_skip', { cardKey: card.id, symbol: card.symbol, market: card.market, positionIndex: index })}
          />
          {index > 0 && index % 5 === 0 ? <NativeAdCard source="home" slotName={`home_vertical_${index}`} title="제휴 콘텐츠" /> : null}
        </div>
      ))}
    </div>
  );
}
