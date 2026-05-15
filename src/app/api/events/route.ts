import { NextResponse } from 'next/server';
import { logServerEvent } from '@/lib/analytics/logEvent';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        anonUserId?: string;
        eventType?: string;
        cardKey?: string;
        cardId?: string;
        recommendationCardId?: string;
        assetId?: string;
        market?: string;
        metadata?: Record<string, unknown>;
      }
    | null;

  if (!body?.eventType) {
    return NextResponse.json({ ok: false, error: 'eventType required' }, { status: 400 });
  }

  const result = await logServerEvent({
    anonUserId: body.anonUserId ?? 'anonymous',
    eventType: body.eventType,
    cardKey: body.cardKey ?? body.cardId,
    recommendationCardId: body.recommendationCardId,
    assetId: body.assetId,
    market: body.market,
    metadata: body.metadata,
  });

  return NextResponse.json(result);
}
