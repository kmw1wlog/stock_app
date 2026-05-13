import { NextResponse } from 'next/server';
import { feedEnvelope } from '@/lib/marketData';

export async function GET() {
  const payload = await feedEnvelope(50);
  return NextResponse.json({ ...payload, cards: payload.items });
}
