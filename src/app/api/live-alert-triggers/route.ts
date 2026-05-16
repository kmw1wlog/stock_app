import { NextResponse } from 'next/server';
import { getLiveAlertTriggers } from '@/lib/realtimeBackend';

export async function GET() {
  const items = await getLiveAlertTriggers(50);
  return NextResponse.json({
    ok: true,
    source: 'realtime-backend',
    count: items.length,
    items,
  });
}
