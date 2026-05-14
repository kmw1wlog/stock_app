import 'server-only';

import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { getDisplayCards } from '@/lib/marketData';
import type { DisplayCard } from '@/lib/marketDataTypes';

export async function getSearchableStocks(limit = 300): Promise<DisplayCard[]> {
  if (!hasDatabaseUrl()) return getDisplayCards(limit);

  const assets = await prisma.asset.findMany({
    where: { isActive: true },
    include: {
      labels: { orderBy: { updatedAt: 'desc' }, take: 5 },
      dailyPrices: { orderBy: { date: 'desc' }, take: 1 },
      intradayPrices: { orderBy: { time: 'desc' }, take: 1 },
    },
    orderBy: [{ market: 'asc' }, { symbol: 'asc' }],
    take: limit,
  });

  if (!assets.length) return getDisplayCards(limit);

  return assets.map((asset) => {
    const daily = asset.dailyPrices[0];
    const intraday = asset.intradayPrices[0];
    const marketLabel = asset.market === 'KR' ? '국장' : asset.market === 'US' ? '미장' : asset.market === 'CRYPTO' ? '코인' : asset.market;
    return {
      id: asset.id,
      assetKey: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      market: asset.market as DisplayCard['market'],
      marketLabel,
      theme: asset.theme,
      cardType: asset.market === 'US' ? 'us_widget' : asset.market === 'CRYPTO' ? 'crypto_gainer_24h' : 'kr_gainer',
      title: `${asset.name} 검색 결과`,
      primaryReason: asset.labels[0]?.displayText ?? '공식 데이터 기준 종목',
      price: intraday?.close ?? daily?.close,
      changePct: daily?.changePct,
      volume: intraday?.volume ?? daily?.volume,
      amount: intraday?.amount ?? daily?.amount,
      labels: asset.labels.map((label) => label.displayText),
      dataBasisLabel: intraday?.source ? `${intraday.interval} 기준 · ${intraday.source}` : daily?.basis ?? '공식 데이터 기준',
      source: intraday?.source ?? daily?.source ?? 'db',
      updatedAt: (intraday?.time ?? daily?.date ?? asset.updatedAt).toISOString(),
      tvSymbol: asset.tvSymbol,
      coingeckoId: asset.coingeckoId,
      binanceSymbol: asset.binanceSymbol,
      upbitMarket: asset.upbitMarket,
      chartSetupType: asset.labels.find((label) => label.displayText.includes('차트자리'))?.displayText,
      isMock: false,
    };
  });
}

export function filterStocks(cards: DisplayCard[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return cards.slice(0, 20);
  return cards
    .filter((card) => {
      const haystack = [card.name, card.symbol, card.theme, card.marketLabel, card.market, ...card.labels].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(q);
    })
    .slice(0, 30);
}
