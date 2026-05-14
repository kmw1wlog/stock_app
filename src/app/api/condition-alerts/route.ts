import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { logServerEvent } from '@/lib/analytics/logEvent';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';

type AlertBody = {
  id?: string;
  anonUserId?: string;
  cardKey?: string;
  assetKey?: string;
  market?: string;
  symbol?: string;
  formulaKey?: string;
  formulaName?: string;
  alertScope?: string;
  status?: string;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
};

function fallbackItem(body: AlertBody) {
  const now = new Date().toISOString();
  return {
    id: body.id ?? `fallback_${body.cardKey ?? 'card'}_${body.formulaKey ?? 'formula'}`,
    anonUserId: body.anonUserId ?? 'anonymous',
    cardKey: body.cardKey ?? '',
    assetKey: body.assetKey ?? null,
    market: body.market ?? null,
    symbol: body.symbol ?? null,
    formulaKey: body.formulaKey ?? '',
    formulaName: body.formulaName ?? '',
    alertScope: body.alertScope ?? 'asset_formula',
    status: body.status ?? 'active',
    expiresAt: body.expiresAt ?? null,
    lastTriggeredAt: null,
    metadata: body.metadata ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function GET(request: Request) {
  const anonUserId = new URL(request.url).searchParams.get('anonUserId');
  if (!anonUserId) return NextResponse.json({ ok: false, error: 'anonUserId required' }, { status: 400 });
  if (!hasDatabaseUrl()) return NextResponse.json({ ok: true, mode: 'fallback', items: [] });

  const items = await prisma.userConditionAlert.findMany({
    where: { anonUserId, status: { not: 'deleted' } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return NextResponse.json({ ok: true, mode: 'live', items });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as AlertBody | null;
  if (!body?.anonUserId || !body.cardKey || !body.formulaKey || !body.formulaName) {
    return NextResponse.json({ ok: false, error: 'anonUserId, cardKey, formulaKey, formulaName required' }, { status: 400 });
  }

  if (!hasDatabaseUrl()) {
    const item = fallbackItem(body);
    await logServerEvent({
      anonUserId: body.anonUserId,
      eventType: 'condition_alert_create',
      cardKey: body.cardKey,
      market: body.market,
      metadata: body,
    });
    return NextResponse.json({ ok: true, mode: 'fallback', item });
  }

  const item = await prisma.userConditionAlert.create({
    data: {
      anonUserId: body.anonUserId,
      cardKey: body.cardKey,
      assetKey: body.assetKey,
      market: body.market,
      symbol: body.symbol,
      formulaKey: body.formulaKey,
      formulaName: body.formulaName,
      alertScope: body.alertScope ?? 'asset_formula',
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      metadata: body.metadata as Prisma.InputJsonValue | undefined,
    },
  });
  await logServerEvent({
    anonUserId: body.anonUserId,
    eventType: 'condition_alert_create',
    cardKey: body.cardKey,
    market: body.market,
    metadata: { ...body, alertId: item.id },
  });
  return NextResponse.json({ ok: true, mode: 'live', item });
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => null)) as AlertBody | null;
  if (!body?.id) return NextResponse.json({ ok: false, error: 'id required' }, { status: 400 });

  if (!hasDatabaseUrl()) return NextResponse.json({ ok: true, mode: 'fallback', item: fallbackItem(body) });

  const item = await prisma.userConditionAlert.update({
    where: { id: body.id },
    data: {
      status: body.status,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      metadata: body.metadata as Prisma.InputJsonValue | undefined,
    },
  });
  await logServerEvent({
    anonUserId: item.anonUserId,
    eventType: body.status === 'paused' ? 'condition_alert_cancel' : body.status === 'active' ? 'condition_alert_extend' : 'condition_alert_cancel',
    cardKey: item.cardKey,
    market: item.market ?? undefined,
    metadata: { alertId: item.id, status: item.status },
  });
  return NextResponse.json({ ok: true, mode: 'live', item });
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ ok: false, error: 'id required' }, { status: 400 });
  if (!hasDatabaseUrl()) return NextResponse.json({ ok: true, mode: 'fallback' });

  const item = await prisma.userConditionAlert.update({ where: { id }, data: { status: 'deleted' } });
  await logServerEvent({ anonUserId: item.anonUserId, eventType: 'condition_alert_cancel', cardKey: item.cardKey, market: item.market ?? undefined, metadata: { alertId: item.id, status: 'deleted' } });
  return NextResponse.json({ ok: true, mode: 'live' });
}
