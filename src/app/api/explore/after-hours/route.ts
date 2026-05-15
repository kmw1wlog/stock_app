import { NextResponse } from 'next/server';
import { exploreMeta, getExplorePayload } from '@/lib/exploreLive';

export async function GET() {
  const payload = await getExplorePayload('after-hours');
  return NextResponse.json({ ...payload, config: exploreMeta['after-hours'], cards: payload.items });
}
