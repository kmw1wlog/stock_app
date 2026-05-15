'use client';

import { useEffect, useMemo, useState } from 'react';
import { HomeFeedSortTabs, type HomeFeedSort } from '@/components/home/HomeFeedSortTabs';
import { HomeHeader } from '@/components/home/HomeHeader';
import { getDefaultMarketByTime, type MarketSession } from '@/components/home/MarketSessionClock';
import { VerticalStockFeed } from '@/components/home/VerticalStockFeed';
import { MobileShell } from '@/components/layout/MobileShell';
import type { DisplayCard } from '@/lib/marketDataTypes';

type FeedResponse = { mode: 'live' | 'mock'; cards?: DisplayCard[]; items?: DisplayCard[]; message?: string };

function sortFeedCards(cards: DisplayCard[], sort: HomeFeedSort) {
  const copy = [...cards];
  if (sort === 'amount') return copy.sort((a, b) => (b.amount ?? b.volume ?? 0) - (a.amount ?? a.volume ?? 0));
  return copy.sort((a, b) => (b.changePct ?? 0) - (a.changePct ?? 0));
}

export default function HomePage() {
  const [cards, setCards] = useState<DisplayCard[]>([]);
  const [activeMarket, setActiveMarket] = useState<MarketSession>(() => getDefaultMarketByTime());
  const [sessionMode, setSessionMode] = useState<'auto' | 'manual'>('auto');
  const [sort, setSort] = useState<HomeFeedSort>('gainer');

  useEffect(() => {
    fetch('/api/cards/feed')
      .then((response) => response.json())
      .then((data: FeedResponse) => setCards(data.cards ?? data.items ?? []))
      .catch(() => setCards([]));
  }, []);

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
