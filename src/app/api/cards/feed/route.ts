import { NextResponse } from 'next/server';
import { feedEnvelope } from '@/lib/marketData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') === 'fast' ? 'fast' : 'default';
  const payload = await feedEnvelope(50, mode);
  return NextResponse.json({ ...payload, requestMode: mode, cards: payload.items });
}
