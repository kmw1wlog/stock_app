import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { fetchBinanceKlines } from '@/lib/providers/crypto/binance';
import { fetchUpbitCandles } from '@/lib/providers/crypto/upbit';
import { fetchKoreaDailyCandles } from '@/lib/providers/korea/dataGoKr';

export type Candle = {
  time: string;
  open?: number;
  high?: number;
  low?: number;
  close: number;
  volume?: number;
};

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function normalizedToCandle(item: { time: string; open?: number; high?: number; low?: number; close?: number; volume?: number }): Candle | null {
  if (!item.close) return null;
  return {
    time: item.time.slice(0, 10),
    open: item.open ?? item.close,
    high: item.high ?? item.close,
    low: item.low ?? item.close,
    close: item.close,
    volume: item.volume,
  };
}

async function saveDailyCandles(assetId: string, source: string, basis: string, candles: Array<{ time: string; open?: number; high?: number; low?: number; close?: number; volume?: number; amount?: number }>) {
  if (!hasDatabaseUrl()) return;
  for (const candle of candles) {
    if (!candle.close) continue;
    await prisma.assetPriceDaily.upsert({
      where: {
        assetId_date_source: {
          assetId,
          date: new Date(candle.time),
          source,
        },
      },
      update: {
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume,
        amount: candle.amount,
        basis,
      },
      create: {
        assetId,
        date: new Date(candle.time),
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume,
        amount: candle.amount,
        source,
        basis,
      },
    });
  }
}

export async function getDailyCandles(assetKey: string): Promise<{ candles: Candle[]; fallback: boolean; basis: string; source: string; updatedAt: string | null; message?: string }> {
  if (!hasDatabaseUrl()) {
    return { candles: [], fallback: false, basis: 'AssetPriceDaily · DB 미연결', source: 'db', updatedAt: null, message: '차트 데이터 준비중' };
  }

  const asset = await prisma.asset.findFirst({
    where: { OR: [{ id: assetKey }, { symbol: assetKey }, { dataGoKrCode: assetKey }, { binanceSymbol: assetKey }, { upbitMarket: assetKey }] },
    select: { id: true, market: true, symbol: true, dataGoKrCode: true, binanceSymbol: true, upbitMarket: true },
  });
  if (!asset) {
    return { candles: [], fallback: false, basis: 'AssetPriceDaily · asset 없음', source: 'db', updatedAt: null, message: '차트 데이터 준비중' };
  }

  const prices = await prisma.assetPriceDaily.findMany({ where: { assetId: asset.id }, orderBy: { date: 'asc' }, take: 120 });
  const dbCandles = prices
    .filter((price) => price.close)
    .map((price) => ({
      time: toDateKey(price.date),
      open: price.open ?? price.close ?? undefined,
      high: price.high ?? price.close ?? undefined,
      low: price.low ?? price.close ?? undefined,
      close: price.close ?? 0,
      volume: price.volume ?? undefined,
    }));

  if (dbCandles.length) {
    return { candles: dbCandles, fallback: false, basis: 'AssetPriceDaily · DB 저장 데이터', source: prices.at(-1)?.source ?? 'db', updatedAt: prices.at(-1)?.createdAt.toISOString() ?? null };
  }

  if (asset.market === 'KR') {
    const symbol = asset.dataGoKrCode ?? asset.symbol;
    const result = await fetchKoreaDailyCandles(symbol, 120);
    const candles = result.data.map(normalizedToCandle).filter((candle): candle is Candle => Boolean(candle));
    if (candles.length) {
      await saveDailyCandles(asset.id, result.source, result.basis, result.data);
      return { candles, fallback: true, basis: result.basis, source: result.source, updatedAt: result.fetchedAt };
    }
    return { candles: [], fallback: false, basis: result.basis, source: result.source, updatedAt: result.fetchedAt, message: result.basis.includes('API 키 필요') ? 'DATA_GO_KR_SERVICE_KEY 필요' : '차트 데이터 준비중' };
  }

  if (asset.market === 'CRYPTO') {
    const result = asset.binanceSymbol
      ? await fetchBinanceKlines(asset.binanceSymbol, '1d', 120)
      : asset.upbitMarket
        ? await fetchUpbitCandles(asset.upbitMarket, 'days', 120)
        : null;
    if (result) {
      const candles = result.data.map(normalizedToCandle).filter((candle): candle is Candle => Boolean(candle));
      if (candles.length) {
        await saveDailyCandles(asset.id, result.source, result.basis, result.data);
        return { candles, fallback: true, basis: result.basis, source: result.source, updatedAt: result.fetchedAt };
      }
      return { candles: [], fallback: false, basis: result.basis, source: result.source, updatedAt: result.fetchedAt, message: '차트 데이터 준비중' };
    }
  }

  return { candles: [], fallback: false, basis: 'AssetPriceDaily · DB 저장 데이터 없음', source: 'db', updatedAt: null, message: '차트 데이터 준비중' };
}
