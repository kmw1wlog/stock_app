import type { Prisma } from '@prisma/client';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import type { AssetLabelView } from '@/lib/labels/labelEngine';
import type { NormalizedCandle, NormalizedQuote } from '@/lib/providers/types';

export async function ensureAsset(input: {
  market: string;
  symbol: string;
  name?: string;
  theme?: string;
  tvSymbol?: string;
  coingeckoId?: string;
  binanceSymbol?: string;
  upbitMarket?: string;
  dataGoKrCode?: string;
  dartCorpCode?: string;
  cik?: string;
}) {
  if (!hasDatabaseUrl()) {
    return { id: `${input.market}:${input.symbol}`, fallback: true };
  }

  const asset = await prisma.asset.upsert({
    where: { market_symbol: { market: input.market, symbol: input.symbol } },
    create: {
      market: input.market,
      symbol: input.symbol,
      name: input.name ?? input.symbol,
      theme: input.theme,
      tvSymbol: input.tvSymbol,
      coingeckoId: input.coingeckoId,
      binanceSymbol: input.binanceSymbol,
      upbitMarket: input.upbitMarket,
      dataGoKrCode: input.dataGoKrCode,
      dartCorpCode: input.dartCorpCode,
      cik: input.cik,
    },
    update: {
      name: input.name ?? input.symbol,
      theme: input.theme,
      tvSymbol: input.tvSymbol,
      coingeckoId: input.coingeckoId,
      binanceSymbol: input.binanceSymbol,
      upbitMarket: input.upbitMarket,
      dataGoKrCode: input.dataGoKrCode,
      dartCorpCode: input.dartCorpCode,
      cik: input.cik,
    },
  });
  return { id: asset.id, fallback: false };
}

export async function saveIntradayQuote(input: { assetId: string; quote: NormalizedQuote; interval?: string }) {
  if (!hasDatabaseUrl()) {
    return { saved: false, fallback: true };
  }

  const time = new Date(new Date().toISOString().slice(0, 13) + ':00:00.000Z');
  await prisma.assetPriceIntraday.upsert({
    where: {
      assetId_interval_time_source: {
        assetId: input.assetId,
        interval: input.interval ?? '24h',
        time,
        source: input.quote.source,
      },
    },
    create: {
      assetId: input.assetId,
      interval: input.interval ?? '24h',
      time,
      close: input.quote.price,
      volume: input.quote.volume,
      amount: input.quote.amount,
      source: input.quote.source,
      raw: input.quote as unknown as Prisma.InputJsonValue,
    },
    update: {
      close: input.quote.price,
      volume: input.quote.volume,
      amount: input.quote.amount,
      raw: input.quote as unknown as Prisma.InputJsonValue,
    },
  });
  return { saved: true, fallback: false };
}

export async function saveDailyQuote(input: { assetId: string; quote: NormalizedQuote }) {
  if (!hasDatabaseUrl()) {
    return { saved: false, fallback: true };
  }

  await prisma.assetPriceDaily.upsert({
    where: {
      assetId_date_source: {
        assetId: input.assetId,
        date: new Date(new Date().toISOString().slice(0, 10)),
        source: input.quote.source,
      },
    },
    create: {
      assetId: input.assetId,
      date: new Date(new Date().toISOString().slice(0, 10)),
      close: input.quote.price,
      volume: input.quote.volume,
      amount: input.quote.amount,
      changePct: input.quote.changePct,
      source: input.quote.source,
      basis: input.quote.basis,
      raw: input.quote as unknown as Prisma.InputJsonValue,
    },
    update: {
      close: input.quote.price,
      volume: input.quote.volume,
      amount: input.quote.amount,
      changePct: input.quote.changePct,
      basis: input.quote.basis,
      raw: input.quote as unknown as Prisma.InputJsonValue,
    },
  });
  return { saved: true, fallback: false };
}

export async function saveLabels(input: { assetId: string; labels: AssetLabelView[]; source: string }) {
  if (!hasDatabaseUrl()) {
    return { saved: 0, fallback: true };
  }

  for (const label of input.labels) {
    await prisma.assetLabel.upsert({
      where: {
        assetId_labelType_labelKey: {
          assetId: input.assetId,
          labelType: label.labelType,
          labelKey: label.labelKey,
        },
      },
      create: {
        assetId: input.assetId,
        labelType: label.labelType,
        labelKey: label.labelKey,
        displayText: label.displayText,
        grade: label.grade,
        score: label.score,
        source: input.source,
        basis: label.basis,
        basisJson: label as unknown as Prisma.InputJsonValue,
      },
      update: {
        displayText: label.displayText,
        grade: label.grade,
        score: label.score,
        source: input.source,
        basis: label.basis,
        basisJson: label as unknown as Prisma.InputJsonValue,
      },
    });
  }
  return { saved: input.labels.length, fallback: false };
}

export async function saveProviderPayload(input: { provider: string; cacheKey: string; payload: unknown; ttlMinutes?: number }) {
  if (!hasDatabaseUrl()) {
    return { saved: false, fallback: true };
  }
  await prisma.providerPayloadCache.upsert({
    where: { provider_cacheKey: { provider: input.provider, cacheKey: input.cacheKey } },
    create: {
      provider: input.provider,
      cacheKey: input.cacheKey,
      payload: input.payload as Prisma.InputJsonValue,
      expiresAt: new Date(Date.now() + (input.ttlMinutes ?? 60) * 60_000),
    },
    update: {
      payload: input.payload as Prisma.InputJsonValue,
      expiresAt: new Date(Date.now() + (input.ttlMinutes ?? 60) * 60_000),
    },
  });
  return { saved: true, fallback: false };
}

export async function saveDailyCandles(input: { assetId: string; candles: NormalizedCandle[]; basis: string }) {
  if (!hasDatabaseUrl()) {
    return { saved: 0, fallback: true };
  }

  let saved = 0;
  for (const candle of input.candles) {
    if (!candle.close) continue;
    await prisma.assetPriceDaily.upsert({
      where: {
        assetId_date_source: {
          assetId: input.assetId,
          date: new Date(candle.time),
          source: candle.source,
        },
      },
      create: {
        assetId: input.assetId,
        date: new Date(candle.time),
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume,
        amount: candle.amount,
        source: candle.source,
        basis: input.basis,
        raw: candle as unknown as Prisma.InputJsonValue,
      },
      update: {
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume,
        amount: candle.amount,
        basis: input.basis,
        raw: candle as unknown as Prisma.InputJsonValue,
      },
    });
    saved += 1;
  }
  return { saved, fallback: false };
}

export async function saveIntradayCandles(input: { assetId: string; candles: NormalizedCandle[]; interval: string }) {
  if (!hasDatabaseUrl()) {
    return { saved: 0, fallback: true };
  }

  let saved = 0;
  for (const candle of input.candles) {
    if (!candle.close) continue;
    await prisma.assetPriceIntraday.upsert({
      where: {
        assetId_interval_time_source: {
          assetId: input.assetId,
          interval: input.interval,
          time: new Date(candle.time),
          source: candle.source,
        },
      },
      create: {
        assetId: input.assetId,
        interval: input.interval,
        time: new Date(candle.time),
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume,
        amount: candle.amount,
        source: candle.source,
        raw: candle as unknown as Prisma.InputJsonValue,
      },
      update: {
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume,
        amount: candle.amount,
        raw: candle as unknown as Prisma.InputJsonValue,
      },
    });
    saved += 1;
  }
  return { saved, fallback: false };
}
