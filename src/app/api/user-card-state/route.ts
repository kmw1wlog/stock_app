import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';

type StateBody = {
  anonUserId?: string;
  cardKey?: string;
  assetKey?: string;
  state?: string;
  source?: string;
  market?: string;
  metadata?: Record<string, unknown>;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const anonUserId = searchParams.get('anonUserId');

  if (!anonUserId) {
    return NextResponse.json({ ok: false, error: 'anonUserId required' }, { status: 400 });
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json({ ok: true, fallback: true, states: [] });
  }

  const states = await prisma.userCardState.findMany({
    where: { anonUserId },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ ok: true, fallback: false, states });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as StateBody | null;

  if (!body?.anonUserId || !body.cardKey || !body.state) {
    return NextResponse.json({ ok: false, error: 'anonUserId, cardKey, state required' }, { status: 400 });
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json({ ok: true, fallback: true });
  }

  const state = await prisma.userCardState.upsert({
    where: {
      anonUserId_cardKey_state: {
        anonUserId: body.anonUserId,
        cardKey: body.cardKey,
        state: body.state,
      },
    },
    create: {
      anonUserId: body.anonUserId,
      cardKey: body.cardKey,
      assetKey: body.assetKey,
      state: body.state,
      source: body.source,
      market: body.market,
      metadata: body.metadata as Prisma.InputJsonValue | undefined,
    },
    update: {
      assetKey: body.assetKey,
      source: body.source,
      market: body.market,
      metadata: body.metadata as Prisma.InputJsonValue | undefined,
    },
  });

  return NextResponse.json({ ok: true, fallback: false, state });
}

export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => null)) as StateBody | null;

  if (!body?.anonUserId || !body.cardKey || !body.state) {
    return NextResponse.json({ ok: false, error: 'anonUserId, cardKey, state required' }, { status: 400 });
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json({ ok: true, fallback: true });
  }

  await prisma.userCardState.deleteMany({
    where: {
      anonUserId: body.anonUserId,
      cardKey: body.cardKey,
      state: body.state,
    },
  });

  return NextResponse.json({ ok: true, fallback: false });
}
