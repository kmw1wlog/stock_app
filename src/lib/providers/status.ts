import type { Prisma } from '@prisma/client';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import type { ProviderFetchOutcome } from '@/lib/providers/types';

export type ProviderStatusInput = {
  provider: string;
  dataType: string;
  status: 'success' | 'missing_env' | 'failed' | 'blocked' | 'not_implemented' | 'partial';
  itemCount?: number;
  envMissing?: string[];
  samplePayload?: unknown;
  notes?: string;
  lastError?: string | null;
};

function toJson(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) return undefined;
  return value as Prisma.InputJsonValue;
}

export async function recordProviderStatus(input: ProviderStatusInput) {
  if (!hasDatabaseUrl()) {
    return { saved: false, fallback: true, status: input.status };
  }

  const now = new Date();
  await prisma.dataProviderStatus.upsert({
    where: { provider_dataType: { provider: input.provider, dataType: input.dataType } },
    create: {
      provider: input.provider,
      dataType: input.dataType,
      status: input.status,
      lastCheckedAt: now,
      lastSuccessAt: input.status === 'success' ? now : undefined,
      lastError: input.lastError ?? undefined,
      itemCount: input.itemCount ?? 0,
      envMissing: toJson(input.envMissing ?? []),
      samplePayload: toJson(input.samplePayload),
      notes: input.notes,
    },
    update: {
      status: input.status,
      lastCheckedAt: now,
      lastSuccessAt: input.status === 'success' ? now : undefined,
      lastError: input.lastError ?? undefined,
      itemCount: input.itemCount ?? 0,
      envMissing: toJson(input.envMissing ?? []),
      samplePayload: toJson(input.samplePayload),
      notes: input.notes,
    },
  });

  return { saved: true, fallback: false, status: input.status };
}

export async function recordFetchOutcome<T>(input: {
  dataType: string;
  outcome: ProviderFetchOutcome<T>;
  itemCount?: number;
  samplePayload?: unknown;
  notes?: string;
}) {
  const status = input.outcome.ok ? 'success' : input.outcome.envMissing?.length ? 'missing_env' : 'failed';
  return recordProviderStatus({
    provider: input.outcome.provider,
    dataType: input.dataType,
    status,
    itemCount: input.itemCount ?? (Array.isArray(input.outcome.data) ? input.outcome.data.length : input.outcome.data ? 1 : 0),
    envMissing: input.outcome.envMissing,
    samplePayload: input.samplePayload ?? input.outcome.data,
    notes: input.notes ?? input.outcome.basis,
    lastError: input.outcome.error,
  });
}
