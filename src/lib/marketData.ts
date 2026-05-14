import 'server-only';

import { stockCards } from '@/data/mockStocks';
import { emptyDataMessage, getDataMode, isMockAllowed } from '@/lib/dataMode';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import type { MarketType } from '@/lib/display/displayPolicy';
import type { DataEnvelope, DisplayCard } from '@/lib/marketDataTypes';
import { fetchAlternativeFearGreed } from '@/lib/providers/crypto/alternativeFearGreed';
import { fetchBinance24hTicker } from '@/lib/providers/crypto/binance';
import { fetchUpbitTicker } from '@/lib/providers/crypto/upbit';

const nowIso = () => new Date().toISOString();

function marketLabel(market: string) {
  if (market === 'KR') return '국장';
  if (market === 'US') return '미장';
  if (market === 'CRYPTO') return '코인';
  return market;
}

function firstNumber(...values: Array<number | null | undefined>) {
  return values.find((value) => value !== null && value !== undefined);
}

function labelTexts(labels: Array<{ displayText: string }> = []) {
  return labels.map((label) => label.displayText).filter(Boolean).slice(0, 5);
}

export function envelope<T>(items: T[], source: string, basis: string, extra: Partial<DataEnvelope<T>> = {}): DataEnvelope<T> {
  return {
    ok: true,
    mode: getDataMode(),
    source,
    basis,
    updatedAt: nowIso(),
    items,
    ...extra,
  };
}

function mockCards(limit: number): DisplayCard[] {
  if (!isMockAllowed()) return [];
  return stockCards.slice(0, limit).map((card) => ({
    id: card.id,
    assetKey: card.id,
    symbol: card.symbol,
    name: card.name,
    market: card.marketType,
    marketLabel: card.market,
    theme: card.theme,
    cardType: card.fomoType,
    title: card.titleReason,
    primaryReason: card.titleReason,
    secondaryReason: card.subReason,
    price: null,
    changePct: card.marketType === 'US' ? null : card.priceChangeRate,
    labels: card.coreLabels,
    dataBasisLabel: `${card.dataBasisLabel} · 개발 mock`,
    source: 'mock',
    updatedAt: nowIso(),
    tvSymbol: card.tvSymbol,
    coingeckoId: card.coingeckoId,
    chartSetupType: card.chartSetupType,
    isWidget: card.marketType === 'US',
    isMock: true,
  }));
}

async function fetchPublicCryptoQuote(asset: { binanceSymbol: string; upbitMarket: string }) {
  const binance = await fetchBinance24hTicker(asset.binanceSymbol);
  if (binance.data?.price) return binance;
  const upbit = await fetchUpbitTicker(asset.upbitMarket);
  return upbit;
}

async function publicCryptoCards(limit: number): Promise<DisplayCard[]> {
  const symbols = [
    { symbol: 'BTC', binanceSymbol: 'BTCUSDT', upbitMarket: 'KRW-BTC', name: 'Bitcoin', theme: '대형코인', coingeckoId: 'bitcoin', tvSymbol: 'BINANCE:BTCUSDT' },
    { symbol: 'ETH', binanceSymbol: 'ETHUSDT', upbitMarket: 'KRW-ETH', name: 'Ethereum', theme: '대형코인', coingeckoId: 'ethereum', tvSymbol: 'BINANCE:ETHUSDT' },
    { symbol: 'SOL', binanceSymbol: 'SOLUSDT', upbitMarket: 'KRW-SOL', name: 'Solana', theme: 'L1', coingeckoId: 'solana', tvSymbol: 'BINANCE:SOLUSDT' },
  ];
  const cards: DisplayCard[] = [];

  for (const asset of symbols) {
    const result = await fetchPublicCryptoQuote(asset);
    if (!result.data?.price) continue;
    const changePct = result.data.changePct ?? 0;
    cards.push({
      id: `public-crypto-${asset.symbol.toLowerCase()}`,
      assetKey: asset.symbol,
      symbol: asset.symbol,
      name: asset.name,
      market: 'CRYPTO',
      marketLabel: '코인',
      theme: asset.theme,
      cardType: changePct >= 0 ? 'crypto_gainer_24h' : 'crypto_loser_24h',
      title: `${asset.name} 24h 공개 API`,
      primaryReason: `24h 기준 ${changePct >= 0 ? '상승' : '하락'} 데이터가 확인됐습니다.`,
      secondaryReason: 'DB가 비어 있어도 keyless public API 데이터만 표시합니다.',
      price: result.data.price,
      changePct: result.data.changePct,
      volume: result.data.volume,
      amount: result.data.amount,
      labels: ['24h 가격 데이터', '거래량 데이터 확인'],
      dataBasisLabel: result.data.basis,
      source: result.source,
      updatedAt: result.fetchedAt,
      tvSymbol: asset.tvSymbol,
      coingeckoId: asset.coingeckoId,
      binanceSymbol: asset.binanceSymbol,
      upbitMarket: asset.upbitMarket,
      chartSetupType: '24h 가격/거래량 확인',
      isWidget: false,
      isMock: false,
    });
  }

  const fearGreed = await fetchAlternativeFearGreed();
  if (fearGreed.data) {
    cards.push({
      id: 'public-crypto-fear-greed',
      assetKey: 'crypto-market-sentiment',
      symbol: 'FNG',
      name: 'Crypto Fear & Greed',
      market: 'CRYPTO',
      marketLabel: '코인',
      theme: '시장심리',
      cardType: 'crypto_fear_greed',
      title: '공포탐욕 지수',
      primaryReason: `시장심리 ${fearGreed.data.value_classification ?? '자료 확인'} · ${fearGreed.data.value ?? 'N/A'}`,
      price: Number(fearGreed.data.value),
      changePct: null,
      labels: ['공포탐욕 지수'],
      dataBasisLabel: fearGreed.basis,
      source: fearGreed.source,
      updatedAt: fearGreed.fetchedAt,
      isWidget: false,
      isMock: false,
    });
  }

  return cards.slice(0, limit);
}

function cardTypeFrom(market: string, changePct?: number | null, labels: string[] = []) {
  if (market === 'US') return labels.some((label) => label.includes('SEC') || label.includes('공시')) ? 'us_sec_event' : 'us_widget';
  if (market === 'CRYPTO') return changePct !== undefined && changePct !== null && changePct < 0 ? 'crypto_loser_24h' : 'crypto_gainer_24h';
  if (labels.some((label) => label.includes('공시'))) return 'kr_disclosure';
  if (labels.some((label) => label.includes('뉴스'))) return 'kr_news';
  if (changePct !== undefined && changePct !== null && changePct < 0) return 'kr_loser';
  return 'kr_gainer';
}

function fromAsset(asset: {
  id: string;
  market: string;
  symbol: string;
  name: string;
  theme?: string | null;
  tvSymbol?: string | null;
  coingeckoId?: string | null;
  binanceSymbol?: string | null;
  upbitMarket?: string | null;
  updatedAt: Date;
  labels?: Array<{ displayText: string }>;
  dailyPrices?: Array<{ close: number | null; changePct: number | null; volume: number | null; amount: number | null; basis: string; source: string; date: Date }>;
  intradayPrices?: Array<{ interval: string; close: number | null; volume: number | null; amount: number | null; source: string; time: Date }>;
}): DisplayCard | null {
  const daily = asset.dailyPrices?.[0];
  const intraday = asset.intradayPrices?.[0];
  const labels = labelTexts(asset.labels);
  const price = firstNumber(intraday?.close, daily?.close);
  const changePct = daily?.changePct;

  if (asset.market === 'US' && asset.tvSymbol) {
    return {
      id: asset.id,
      assetKey: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      market: 'US',
      marketLabel: '미장',
      theme: asset.theme,
      cardType: cardTypeFrom(asset.market, changePct, labels),
      title: `${asset.name} 공식 위젯/SEC 데이터`,
      primaryReason: labels[0] ?? 'TradingView 위젯 기준 가격/차트를 확인할 수 있습니다.',
      secondaryReason: '직접 가격 API가 없으면 자체 등락률은 표시하지 않습니다.',
      price: null,
      changePct: null,
      labels,
      dataBasisLabel: labels.some((label) => label.includes('SEC')) ? 'SEC EDGAR 기준 · TradingView 위젯 가격' : 'TradingView 위젯 기준',
      source: labels.some((label) => label.includes('SEC')) ? 'sec-edgar/tradingview' : 'tradingview',
      updatedAt: asset.updatedAt.toISOString(),
      tvSymbol: asset.tvSymbol,
      coingeckoId: asset.coingeckoId,
      chartSetupType: labels.find((label) => label.includes('차트자리')),
      isWidget: true,
      isMock: false,
    };
  }

  if (!price && !labels.length) return null;

  const market = asset.market as MarketType;
  const basis = intraday?.source
    ? `${intraday.interval} 기준 · ${intraday.source}`
    : daily?.basis ?? (market === 'CRYPTO' ? '24h 기준 · public API' : '전일 기준 · 공공데이터');
  return {
    id: asset.id,
    assetKey: asset.id,
    symbol: asset.symbol,
    name: asset.name,
    market,
    marketLabel: marketLabel(asset.market),
    theme: asset.theme,
    cardType: cardTypeFrom(asset.market, changePct, labels),
    title: `${asset.name} 공식 데이터 기준`,
    primaryReason: labels[0] ?? (changePct === undefined || changePct === null ? '공식 데이터가 저장된 종목입니다.' : `${changePct >= 0 ? '상승' : '하락'} 데이터가 확인됐습니다.`),
    secondaryReason: labels[1],
    price,
    changePct,
    volume: firstNumber(intraday?.volume, daily?.volume),
    amount: firstNumber(intraday?.amount, daily?.amount),
    labels,
    dataBasisLabel: basis,
    source: intraday?.source ?? daily?.source ?? 'db',
    updatedAt: (intraday?.time ?? daily?.date ?? asset.updatedAt).toISOString(),
    tvSymbol: asset.tvSymbol,
    coingeckoId: asset.coingeckoId,
    binanceSymbol: asset.binanceSymbol,
    upbitMarket: asset.upbitMarket,
    chartSetupType: labels.find((label) => label.includes('차트자리')),
    isWidget: false,
    isMock: false,
  };
}

export async function getDisplayCards(limit = 50): Promise<DisplayCard[]> {
  if (!hasDatabaseUrl()) {
    const liveCards = await publicCryptoCards(limit);
    return liveCards.length ? liveCards : mockCards(limit);
  }

  const cards = await prisma.recommendationCard.findMany({
    where: { status: 'active' },
    include: {
      asset: {
        include: {
          labels: { orderBy: { updatedAt: 'desc' }, take: 6 },
          dailyPrices: { orderBy: { date: 'desc' }, take: 1 },
          intradayPrices: { orderBy: { time: 'desc' }, take: 1 },
        },
      },
    },
    orderBy: { detectedAt: 'desc' },
    take: limit,
  });

  if (cards.length) {
    return cards.map((card) => {
      const assetCard = fromAsset(card.asset);
      return {
        ...(assetCard ?? {
          id: card.id,
          assetKey: card.assetId,
          symbol: card.asset.symbol,
          name: card.asset.name,
          market: card.market as MarketType,
          marketLabel: marketLabel(card.market),
          cardType: card.cardType,
          title: card.title,
          primaryReason: card.primaryReason,
          labels: [],
          dataBasisLabel: card.dataBasisLabel ?? '공식 데이터 기준',
          source: 'db',
          isMock: false,
        }),
        id: card.id,
        title: card.title,
        primaryReason: card.primaryReason,
        secondaryReason: card.secondaryReason ?? assetCard?.secondaryReason,
        cardType: card.cardType,
        dataBasisLabel: card.dataBasisLabel ?? assetCard?.dataBasisLabel ?? '공식 데이터 기준',
        isMock: false,
      };
    });
  }

  const assets = await prisma.asset.findMany({
    where: { isActive: true },
    include: {
      labels: { orderBy: { updatedAt: 'desc' }, take: 6 },
      dailyPrices: { orderBy: { date: 'desc' }, take: 1 },
      intradayPrices: { orderBy: { time: 'desc' }, take: 1 },
    },
    orderBy: [{ market: 'asc' }, { symbol: 'asc' }],
    take: limit * 3,
  });

  const dbCards = assets.map(fromAsset).filter((card): card is DisplayCard => Boolean(card)).slice(0, limit);
  if (dbCards.length) return dbCards;
  const liveCards = await publicCryptoCards(limit);
  return liveCards.length ? liveCards : mockCards(limit);
}

export async function getDisplayCard(cardKey: string) {
  const cards = await getDisplayCards(300);
  return cards.find((card) => card.id === cardKey || card.assetKey === cardKey || card.symbol === cardKey) ?? null;
}

export function sortCards(cards: DisplayCard[], key: 'gainer' | 'loser' | 'amount' = 'gainer') {
  const copy = [...cards];
  if (key === 'loser') return copy.sort((a, b) => (a.changePct ?? 0) - (b.changePct ?? 0));
  if (key === 'amount') return copy.sort((a, b) => (b.amount ?? b.volume ?? 0) - (a.amount ?? a.volume ?? 0));
  return copy.sort((a, b) => (b.changePct ?? 0) - (a.changePct ?? 0));
}

export async function feedEnvelope(limit = 50) {
  const cards = await getDisplayCards(limit);
  return envelope(cards, cards.length ? 'db/provider' : 'provider', '공식 API/DB/위젯 기준', {
    message: cards.length ? undefined : emptyDataMessage(),
    fallback: false,
  });
}
