import { NextResponse } from 'next/server';
import { exploreMeta, getExplorePayload } from '@/lib/exploreLive';

export async function GET() {
  const payload = await getExplorePayload('news');
  return NextResponse.json({ ...payload, config: exploreMeta.news, cards: payload.items });
}
