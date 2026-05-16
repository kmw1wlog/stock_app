import { NextResponse } from 'next/server';
import { getLiveRuntimeFeed } from '@/lib/realtimeBackend';

export async function GET() {
  const payload = await getLiveRuntimeFeed();
  const items = (payload?.cards ?? payload?.items ?? []) as unknown[];
  return NextResponse.json({
    ok: true,
    source: 'realtime-backend',
    count: items.length,
    items,
    generatedAt: payload?.generatedAt ?? null,
  });
}
