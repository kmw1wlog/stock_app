import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';

export type Candle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

export const fallbackCandles: Candle[] = [
  { time: '2026-05-01', open: 100, high: 108, low: 96, close: 104, volume: 120000 },
  { time: '2026-05-04', open: 104, high: 112, low: 101, close: 110, volume: 180000 },
  { time: '2026-05-05', open: 109, high: 118, low: 106, close: 114, volume: 160000 },
  { time: '2026-05-06', open: 114, high: 121, low: 111, close: 119, volume: 210000 },
  { time: '2026-05-07', open: 118, high: 132, low: 116, close: 129, volume: 310000 },
  { time: '2026-05-08', open: 130, high: 144, low: 126, close: 141, volume: 340000 },
  { time: '2026-05-11', open: 140, high: 151, low: 137, close: 148, volume: 390000 },
];

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getDailyCandles(assetKey: string): Promise<{ candles: Candle[]; fallback: boolean; basis: string }> {
  if (!hasDatabaseUrl()) {
    return { candles: fallbackCandles, fallback: true, basis: 'mock candles · DB 미연결' };
  }

  const asset = await prisma.asset.findFirst({
    where: {
      OR: [{ id: assetKey }, { symbol: assetKey }],
    },
    select: { id: true },
  });

  if (!asset) {
    return { candles: fallbackCandles, fallback: true, basis: 'mock candles · asset 없음' };
  }

  const prices = await prisma.assetPriceDaily.findMany({
    where: { assetId: asset.id },
    orderBy: { date: 'asc' },
    take: 120,
  });

  const candles = prices
    .filter((price) => price.open && price.high && price.low && price.close)
    .map((price) => ({
      time: toDateKey(price.date),
      open: price.open ?? price.close ?? 0,
      high: price.high ?? price.close ?? 0,
      low: price.low ?? price.close ?? 0,
      close: price.close ?? 0,
      volume: price.volume ?? undefined,
    }));

  if (!candles.length) {
    return { candles: fallbackCandles, fallback: true, basis: 'mock candles · AssetPriceDaily 준비중' };
  }

  return { candles, fallback: false, basis: 'AssetPriceDaily · DB 저장 데이터' };
}
