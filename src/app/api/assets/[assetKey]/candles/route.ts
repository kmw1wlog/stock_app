import { NextResponse } from 'next/server';
import { getDailyCandles } from '@/lib/chart/candleService';

export async function GET(_request: Request, { params }: { params: Promise<{ assetKey: string }> }) {
  const { assetKey } = await params;
  const result = await getDailyCandles(assetKey);
  return NextResponse.json({ ok: true, interval: '1d', ...result });
}
