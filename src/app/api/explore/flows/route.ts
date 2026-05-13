import { NextResponse } from 'next/server';
import { exploreMeta, getExplorePayload } from '@/lib/exploreLive';

export async function GET() {
  const payload = await getExplorePayload('flows');
  return NextResponse.json({ ...payload, config: exploreMeta.flows, cards: payload.items });
}
