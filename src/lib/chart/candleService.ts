import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';

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

export async function getDailyCandles(assetKey: string): Promise<{ candles: Candle[]; fallback: boolean; basis: string; source: string; updatedAt: string | null; message?: string }> {
  if (!hasDatabaseUrl()) return { candles: [], fallback: false, basis: 'AssetPriceDaily · DB 미연결', source: 'db', updatedAt: null, message: '차트 데이터 준비중' };

  const asset = await prisma.asset.findFirst({ where: { OR: [{ id: assetKey }, { symbol: assetKey }] }, select: { id: true } });
  if (!asset) return { candles: [], fallback: false, basis: 'AssetPriceDaily · asset 없음', source: 'db', updatedAt: null, message: '차트 데이터 준비중' };

  const prices = await prisma.assetPriceDaily.findMany({ where: { assetId: asset.id }, orderBy: { date: 'asc' }, take: 120 });
  const candles = prices
    .filter((price) => price.close)
    .map((price) => ({
      time: toDateKey(price.date),
      open: price.open ?? price.close ?? undefined,
      high: price.high ?? price.close ?? undefined,
      low: price.low ?? price.close ?? undefined,
      close: price.close ?? 0,
      volume: price.volume ?? undefined,
    }));

  if (!candles.length) return { candles: [], fallback: false, basis: 'AssetPriceDaily · DB 저장 데이터 없음', source: 'db', updatedAt: null, message: '차트 데이터 준비중' };
  return { candles, fallback: false, basis: 'AssetPriceDaily · DB 저장 데이터', source: 'db', updatedAt: prices.at(-1)?.createdAt.toISOString() ?? null };
}
