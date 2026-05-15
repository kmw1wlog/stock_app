import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';

export function assertCronAuth(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return true;
  }
  return request.headers.get('authorization') === `Bearer ${expected}`;
}

export async function runCronJob(request: Request, jobName: string, handler: () => Promise<Record<string, unknown> | void>) {
  if (!assertCronAuth(request)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const startedAt = new Date();
  let cronRunId: string | undefined;

  if (hasDatabaseUrl()) {
    const cronRun = await prisma.cronRun.create({ data: { jobName, status: 'running', startedAt } });
    cronRunId = cronRun.id;
  }

  try {
    const metadata = (await handler()) ?? {};
    if (hasDatabaseUrl() && cronRunId) {
      await prisma.cronRun.update({
        where: { id: cronRunId },
        data: { status: 'success', finishedAt: new Date(), metadata: metadata as Prisma.InputJsonValue },
      });
    }
    return NextResponse.json({ ok: true, jobName, metadata });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    if (hasDatabaseUrl() && cronRunId) {
      await prisma.cronRun.update({
        where: { id: cronRunId },
        data: { status: 'failed', finishedAt: new Date(), message },
      });
    }
    return NextResponse.json({ ok: false, jobName, error: message }, { status: 500 });
  }
}
