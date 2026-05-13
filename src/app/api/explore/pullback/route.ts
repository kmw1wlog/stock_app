import { NextResponse } from 'next/server';
import { exploreMeta, getExplorePayload } from '@/lib/exploreLive';

export async function GET() {
  const payload = await getExplorePayload('pullback');
  return NextResponse.json({ ...payload, config: exploreMeta.pullback, cards: payload.items });
}
