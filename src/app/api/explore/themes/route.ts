import { NextResponse } from 'next/server';
import { exploreMeta, getExplorePayload } from '@/lib/exploreLive';

export async function GET() {
  const payload = await getExplorePayload('themes');
  return NextResponse.json({ ...payload, config: exploreMeta.themes, cards: payload.items });
}
