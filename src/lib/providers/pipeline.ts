import type { Prisma } from '@prisma/client';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import type { AssetLabelView } from '@/lib/labels/labelEngine';
import type { NormalizedQuote } from '@/lib/providers/types';

export async function ensureAsset(input: {
  market: string;
  symbol: string;
  name?: string;
  theme?: string;
  tvSymbol?: string;
  coingeckoId?: string;
  binanceSymbol?: string;
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
    },
    update: {
      name: input.name ?? input.symbol,
      theme: input.theme,
      tvSymbol: input.tvSymbol,
      coingeckoId: input.coingeckoId,
      binanceSymbol: input.binanceSymbol,
    },
  });
  return { id: asset.id, fallback: false };
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
