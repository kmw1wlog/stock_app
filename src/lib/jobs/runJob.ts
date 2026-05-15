import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { jobResultToJson, type JobResult } from '@/lib/jobs/types';

export async function runJobDirect(jobName: string, handler: () => Promise<JobResult>) {
  const startedAt = new Date();
  let cronRunId: string | undefined;

  if (hasDatabaseUrl()) {
    const cronRun = await prisma.cronRun.create({ data: { jobName, status: 'running', startedAt } });
    cronRunId = cronRun.id;
  }

  try {
    const result = await handler();
    if (hasDatabaseUrl() && cronRunId) {
      await prisma.cronRun.update({
        where: { id: cronRunId },
        data: { status: result.ok ? 'success' : 'failed', finishedAt: new Date(), message: result.errors[0]?.message, metadata: jobResultToJson(result) },
      });
    }
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    const failed: JobResult = {
      jobName,
      ok: false,
      mode: process.env.DATA_MODE === 'mock' || process.env.NEXT_PUBLIC_ALLOW_MOCK_DATA === 'true' ? 'mock' : 'live',
      startedAt: startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      provider: jobName,
      fetched: 0,
      normalized: 0,
      saved: 0,
      skipped: 0,
      failed: 1,
      missingEnv: [],
      errors: [{ message }],
    };
    if (hasDatabaseUrl() && cronRunId) {
      await prisma.cronRun.update({ where: { id: cronRunId }, data: { status: 'failed', finishedAt: new Date(), message, metadata: jobResultToJson(failed) } });
    }
    return failed;
  }
}
