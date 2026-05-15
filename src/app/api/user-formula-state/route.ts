import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        anonUserId?: string;
        cardKey?: string;
        platform?: string;
        action?: string;
        metadata?: Record<string, unknown>;
      }
    | null;

  if (!body?.anonUserId || !body.cardKey || !body.platform || !body.action) {
    return NextResponse.json({ ok: false, error: 'anonUserId, cardKey, platform, action required' }, { status: 400 });
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json({ ok: true, fallback: true });
  }

  const state = await prisma.userFormulaState.create({
    data: {
      anonUserId: body.anonUserId,
      cardKey: body.cardKey,
      platform: body.platform,
      action: body.action,
      metadata: body.metadata as Prisma.InputJsonValue | undefined,
    },
  });

  return NextResponse.json({ ok: true, fallback: false, state });
}
