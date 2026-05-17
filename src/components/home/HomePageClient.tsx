'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { HomeHeader } from '@/components/home/HomeHeader';
import { getDefaultMarketByTime, type MarketSession } from '@/components/home/MarketSessionClock';
import { MobileShell } from '@/components/layout/MobileShell';
import type { DisplayCard } from '@/lib/marketDataTypes';

const VerticalStockFeed = dynamic(() => import('@/components/home/VerticalStockFeed').then((mod) => mod.VerticalStockFeed), {
  ssr: false,
  loading: () => <HomeFeedSkeleton />,
});

function sortFeedCards(cards: DisplayCard[]) {
  const copy = [...cards];
  return copy.sort((a, b) => (b.changePct ?? 0) - (a.changePct ?? 0));
}

const localFallbackCards: DisplayCard[] = [
  {
    id: 'fallback-kr-005930',
    assetKey: '005930',
    symbol: '005930',
    name: '삼성전자',
    market: 'KR',
    marketLabel: '국장',
    theme: '반도체',
    cardType: 'kr_gainer',
    title: '삼성전자 기본 관심종목',
    primaryReason: 'API 응답이 지연돼도 홈 화면은 기본 관심종목 셸을 바로 유지합니다.',
    secondaryReason: 'fast feed가 복구되면 실시간 카드로 교체됩니다.',
    labels: ['기본 관심종목', 'fast fallback'],
    dataBasisLabel: '로컬 fallback 기준',
    source: 'local-fallback',
    tvSymbol: 'KRX:005930',
    isMock: false,
  },
  {
    id: 'fallback-kr-000660',
    assetKey: '000660',
    symbol: '000660',
    name: 'SK하이닉스',
    market: 'KR',
    marketLabel: '국장',
    theme: '반도체',
    cardType: 'kr_gainer',
    title: 'SK하이닉스 기본 관심종목',
    primaryReason: '초기 화면은 데이터 fetch와 분리된 shell-first 구조로 유지됩니다.',
    secondaryReason: '조건식 알림 설정은 실제 데이터 도착 전에도 열 수 있습니다.',
    labels: ['기본 관심종목', 'shell-first'],
    dataBasisLabel: '로컬 fallback 기준',
    source: 'local-fallback',
    tvSymbol: 'KRX:000660',
    isMock: false,
  },
  {
    id: 'fallback-us-aapl',
    assetKey: 'AAPL',
    symbol: 'AAPL',
    name: 'Apple',
    market: 'US',
    marketLabel: '미장',
    theme: 'M7',
    cardType: 'us_widget',
    title: 'Apple 위젯 카드',
    primaryReason: '미장 카드는 TradingView 위젯 기준으로 안전하게 fallback 됩니다.',
    secondaryReason: '외부 provider 지연은 첫 화면 HTML 응답을 막지 않습니다.',
    labels: ['위젯 카드', 'fast fallback'],
    dataBasisLabel: '로컬 fallback 기준',
    source: 'local-fallback',
    tvSymbol: 'NASDAQ:AAPL',
    isWidget: true,
    isMock: false,
  },
];

export function HomePageClient({ initialCards, fetchOnMount = false }: { initialCards: DisplayCard[]; fetchOnMount?: boolean }) {
  const [cards, setCards] = useState<DisplayCard[]>(initialCards);
  const [loading, setLoading] = useState(fetchOnMount && initialCards.length === 0);
  const [activeMarket, setActiveMarket] = useState<MarketSession>(() => getDefaultMarketByTime());
  const [sessionMode, setSessionMode] = useState<'auto' | 'manual'>('auto');
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!fetchOnMount || hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    setLoading(true);
    fetch('/api/cards/feed?mode=fast', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data: { items?: DisplayCard[]; cards?: DisplayCard[] }) => {
        const nextCards = data.cards ?? data.items ?? [];
        if (nextCards.length) {
          setCards(nextCards);
          return;
        }
        if (!initialCards.length) {
          setCards(localFallbackCards);
        }
      })
      .catch(() => {
        if (!initialCards.length) setCards(localFallbackCards);
      })
      .finally(() => setLoading(false));
  }, [fetchOnMount, initialCards.length]);

  const sortedFeed = useMemo(() => {
    const marketCards = cards.filter((card) => card.market === activeMarket);
    const feedCards = marketCards.length ? marketCards : cards;
    return sortFeedCards(feedCards);
  }, [activeMarket, cards]);

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
      {loading && cards.length === 0 ? <HomeFeedSkeleton /> : null}
      {!loading || cards.length ? <VerticalStockFeed cards={sortedFeed} allCards={cards} /> : null}
    </MobileShell>
  );
}

function HomeFeedSkeleton() {
  return (
    <div className="space-y-4 px-5 pb-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-[28px] bg-slate-900 px-5 py-6 shadow-xl shadow-slate-900/10">
          <div className="flex gap-2">
            <div className="h-7 w-16 rounded-full bg-white/15" />
            <div className="h-7 w-20 rounded-full bg-white/10" />
          </div>
          <div className="mt-5 h-8 w-40 rounded-xl bg-white/15" />
          <div className="mt-3 h-4 w-24 rounded bg-white/10" />
          <div className="mt-5 h-[120px] rounded-3xl bg-white/10" />
          <div className="mt-5 h-24 rounded-3xl bg-white/10" />
        </div>
      ))}
    </div>
  );
}
