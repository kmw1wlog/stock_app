import type { Prisma } from '@prisma/client';

export type JobError = {
  symbol?: string;
  message: string;
  raw?: unknown;
};

export type JobResult = {
  jobName: string;
  ok: boolean;
  mode: 'live' | 'mock';
  startedAt: string;
  finishedAt: string;
  provider: string;
  fetched: number;
  normalized: number;
  saved: number;
  skipped: number;
  failed: number;
  missingEnv: string[];
  errors: JobError[];
  metadata?: Record<string, unknown>;
};

export type JobContext = {
  startedAt?: Date;
};

export function startJob() {
  return new Date();
}

export function finishJob(input: Omit<JobResult, 'mode' | 'startedAt' | 'finishedAt'> & { startedAt: Date; finishedAt?: Date }): JobResult {
  const finishedAt = input.finishedAt ?? new Date();
  return {
    mode: process.env.DATA_MODE === 'mock' || process.env.NEXT_PUBLIC_ALLOW_MOCK_DATA === 'true' ? 'mock' : 'live',
    startedAt: input.startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    jobName: input.jobName,
    ok: input.ok,
    provider: input.provider,
    fetched: input.fetched,
    normalized: input.normalized,
    saved: input.saved,
    skipped: input.skipped,
    failed: input.failed,
    missingEnv: input.missingEnv,
    errors: input.errors,
    metadata: input.metadata,
  };
}

export function jobResultToJson(result: JobResult): Prisma.InputJsonValue {
  return result as unknown as Prisma.InputJsonValue;
}
