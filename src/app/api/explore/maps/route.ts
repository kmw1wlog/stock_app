import { NextResponse } from 'next/server';
import { exploreMeta, getExplorePayload } from '@/lib/exploreLive';

export async function GET() {
  const payload = await getExplorePayload('maps');
  return NextResponse.json({ ...payload, config: exploreMeta.maps, cards: payload.items });
}
