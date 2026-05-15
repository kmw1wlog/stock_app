import { NextResponse } from 'next/server';
import { exploreMeta, getExplorePayload } from '@/lib/exploreLive';

export async function GET() {
  const payload = await getExplorePayload('movers');
  return NextResponse.json({ ...payload, config: exploreMeta.movers, cards: payload.items });
}
