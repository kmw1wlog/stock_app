'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { SearchSuggestionList } from '@/components/search/SearchSuggestionList';
import { useAppState } from '@/context/AppStateContext';
import type { DisplayCard } from '@/lib/marketDataTypes';

function filter(cards: DisplayCard[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return cards.slice(0, 10);
  return cards
    .filter((card) => [card.name, card.symbol, card.theme, card.marketLabel, card.market, ...card.labels].filter(Boolean).join(' ').toLowerCase().includes(q))
    .slice(0, 30);
}

export function StockSearchBox({ cards }: { cards: DisplayCard[] }) {
  const [query, setQuery] = useState('');
  const { logEvent } = useAppState();
  const results = useMemo(() => filter(cards, query), [cards, query]);
  const source = query.trim() ? 'result' : 'suggestion';
  useEffect(() => {
    logEvent('search_open', { resultCount: cards.length });
  }, [cards.length, logEvent]);
  return (
    <div className="space-y-5">
      <label className="flex h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
        <Search className="h-5 w-5 text-slate-400" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            logEvent('search_query_change', { query: event.target.value });
          }}
          placeholder="종목명, 심볼, 테마 검색"
          className="w-full bg-transparent text-base font-bold outline-none placeholder:text-slate-400"
        />
      </label>
      <section>
        <h2 className="mb-3 text-lg font-black">{query.trim() ? '검색 결과' : '바로 찾아보기'}</h2>
        <SearchSuggestionList cards={results} query={query} source={source} />
      </section>
    </div>
  );
}
