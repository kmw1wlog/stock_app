'use client';

import { useMemo, useState } from 'react';
import { HomeFeedSortTabs, type HomeFeedSort } from '@/components/home/HomeFeedSortTabs';
import { HomeHeader } from '@/components/home/HomeHeader';
import { getDefaultMarketByTime, type MarketSession } from '@/components/home/MarketSessionClock';
import { VerticalStockFeed } from '@/components/home/VerticalStockFeed';
import { MobileShell } from '@/components/layout/MobileShell';
import type { DisplayCard } from '@/lib/marketDataTypes';

function sortFeedCards(cards: DisplayCard[], sort: HomeFeedSort) {
  const copy = [...cards];
  if (sort === 'amount') return copy.sort((a, b) => (b.amount ?? b.volume ?? 0) - (a.amount ?? a.volume ?? 0));
  return copy.sort((a, b) => (b.changePct ?? 0) - (a.changePct ?? 0));
}

export function HomePageClient({ initialCards }: { initialCards: DisplayCard[] }) {
  const [cards] = useState<DisplayCard[]>(initialCards);
  const [activeMarket, setActiveMarket] = useState<MarketSession>(() => getDefaultMarketByTime());
  const [sessionMode, setSessionMode] = useState<'auto' | 'manual'>('auto');
  const [sort, setSort] = useState<HomeFeedSort>('gainer');

  const sortedFeed = useMemo(() => {
    const marketCards = cards.filter((card) => card.market === activeMarket);
    const feedCards = marketCards.length ? marketCards : cards;
    return sortFeedCards(feedCards, sort);
  }, [activeMarket, cards, sort]);

  return (
    <MobileShell>
      <HomeHeader
        activeMarket={activeMarket}
        sessionMode={sessionMode}
        onMarketChange={(market, mode) => {
          setActiveMarket(market);
          setSessionMode(mode);
        }}
      />
      <HomeFeedSortTabs sort={sort} activeMarket={activeMarket} onChange={setSort} />
      <VerticalStockFeed cards={sortedFeed} allCards={cards} />
    </MobileShell>
  );
}
