'use client';

import { ExternalLink } from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';
import { naverNewsSearchUrl, opendartSearchUrl, xSearchUrl, youtubeSearchUrl } from '@/lib/externalLinks';
import type { DisplayCard } from '@/lib/marketDataTypes';

const targets = [
  { key: 'opendart', label: 'OpenDART 검색', build: (card: DisplayCard) => opendartSearchUrl(card.name, card.symbol) },
  { key: 'youtube', label: 'YouTube 검색', build: (card: DisplayCard) => youtubeSearchUrl(card.name) },
  { key: 'x', label: 'X 검색', build: (card: DisplayCard) => xSearchUrl(card.name) },
  { key: 'naver_news', label: 'Naver 뉴스 검색', build: (card: DisplayCard) => naverNewsSearchUrl(card.name) },
] as const;

export function DetailExternalLinks({ card }: { card: DisplayCard }) {
  const { logEvent } = useAppState();
  return (
    <section className="px-5">
      <h2 className="mb-3 text-xl font-black">외부 탐색</h2>
      <div className="grid grid-cols-2 gap-3">
        {targets.map((target) => (
          <a
            key={target.key}
            href={target.build(card)}
            target="_blank"
            rel="noreferrer"
            onClick={() =>
              logEvent('external_research_click', {
                target: target.key,
                symbol: card.symbol,
                name: card.name,
                cardKey: card.id,
                assetKey: card.assetKey,
                source: 'card_detail',
              })
            }
            className="flex min-h-14 items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-950 shadow-sm"
          >
            {target.label}
            <ExternalLink className="h-4 w-4 text-slate-400" />
          </a>
        ))}
      </div>
    </section>
  );
}
