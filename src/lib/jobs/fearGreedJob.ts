import { hasDatabaseUrl } from '@/lib/db/prisma';
import { startJob, finishJob, type JobResult } from '@/lib/jobs/types';
import { fetchAlternativeFearGreed } from '@/lib/providers/crypto/alternativeFearGreed';
import { saveProviderPayload } from '@/lib/providers/pipeline';
import { recordProviderStatus } from '@/lib/providers/status';

export async function fearGreedJob(): Promise<JobResult> {
  const startedAt = startJob();
  const result = await fetchAlternativeFearGreed();
  const fetched = result.data ? 1 : 0;
  if (hasDatabaseUrl()) {
    await saveProviderPayload({ provider: result.source, cacheKey: 'CRYPTO:fear-greed', payload: result, ttlMinutes: 360 });
  }
  await recordProviderStatus({ provider: 'alternative-fng', dataType: 'crypto_sentiment', status: result.data ? 'success' : 'failed', itemCount: fetched, samplePayload: result.data, notes: result.basis, lastError: result.data ? null : 'No fear-greed data' });
  return finishJob({ jobName: 'fear-greed', ok: Boolean(result.data), provider: result.source, startedAt, fetched, normalized: fetched, saved: hasDatabaseUrl() && result.data ? 1 : 0, skipped: 0, failed: result.data ? 0 : 1, missingEnv: hasDatabaseUrl() ? [] : ['DATABASE_URL'], errors: result.data ? [] : [{ message: 'Alternative Fear & Greed returned no data' }] });
}
