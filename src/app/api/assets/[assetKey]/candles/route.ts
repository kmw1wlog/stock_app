import { NextResponse } from 'next/server';
import { getDataMode } from '@/lib/dataMode';
import { getDailyCandles } from '@/lib/chart/candleService';

export async function GET(_request: Request, { params }: { params: Promise<{ assetKey: string }> }) {
  const { assetKey } = await params;
  const result = await getDailyCandles(assetKey);
  return NextResponse.json({
    ok: true,
    mode: getDataMode(),
    source: result.source,
    basis: result.basis,
    updatedAt: result.updatedAt,
    interval: '1d',
    candles: result.candles,
    items: result.candles,
    fallback: result.fallback,
    message: result.message,
  });
}
