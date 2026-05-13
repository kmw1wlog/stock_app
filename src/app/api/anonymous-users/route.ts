import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        id?: string;
        mixpanelId?: string;
        deviceType?: string;
        appVersion?: string;
        consentVersion?: string;
        preferredMarkets?: string[];
      }
    | null;

  if (!body?.id) {
    return NextResponse.json({ ok: false, error: 'id required' }, { status: 400 });
  }

  if (!hasDatabaseUrl()) {
    return NextResponse.json({ ok: true, fallback: true, id: body.id });
  }

  const user = await prisma.anonymousUser.upsert({
    where: { id: body.id },
    create: {
      id: body.id,
      mixpanelId: body.mixpanelId,
      deviceType: body.deviceType,
      appVersion: body.appVersion,
      consentVersion: body.consentVersion,
      preferredMarkets: body.preferredMarkets,
    },
    update: {
      mixpanelId: body.mixpanelId,
      deviceType: body.deviceType,
      appVersion: body.appVersion,
      consentVersion: body.consentVersion,
      preferredMarkets: body.preferredMarkets,
    } satisfies Prisma.AnonymousUserUpdateInput,
  });

  return NextResponse.json({ ok: true, fallback: false, id: user.id });
}
