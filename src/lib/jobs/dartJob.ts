import type { Prisma } from '@prisma/client';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { startJob, finishJob, type JobResult } from '@/lib/jobs/types';
import { fetchOpenDartRecentFilings } from '@/lib/providers/korea/openDart';
import { saveLabels, saveProviderPayload } from '@/lib/providers/pipeline';
import { recordProviderStatus } from '@/lib/providers/status';

export async function dartJob(): Promise<JobResult> {
  const startedAt = startJob();
  if (!process.env.OPENDART_API_KEY) {
    await recordProviderStatus({ provider: 'opendart', dataType: 'kr_disclosure', status: 'missing_env', envMissing: ['OPENDART_API_KEY'] });
    return finishJob({ jobName: 'dart', ok: false, provider: 'opendart', startedAt, fetched: 0, normalized: 0, saved: 0, skipped: 0, failed: 0, missingEnv: ['OPENDART_API_KEY'], errors: [] });
  }
  if (!hasDatabaseUrl()) return finishJob({ jobName: 'dart', ok: false, provider: 'opendart', startedAt, fetched: 0, normalized: 0, saved: 0, skipped: 0, failed: 1, missingEnv: ['DATABASE_URL'], errors: [{ message: 'DATABASE_URL missing' }] });

  const assets = await prisma.asset.findMany({ where: { market: 'KR', isActive: true, dartCorpCode: { not: null } }, take: 150 });
  let fetched = 0;
  let saved = 0;
  let labels = 0;

  for (const asset of assets) {
    if (!asset.dartCorpCode) continue;
    const result = await fetchOpenDartRecentFilings(asset.dartCorpCode);
    fetched += 1;
    await saveProviderPayload({ provider: result.source, cacheKey: `KR:${asset.dartCorpCode}:dart`, payload: result, ttlMinutes: 360 });
    for (const item of result.data) {
      await prisma.newsMention.create({
        data: {
          assetId: asset.id,
          market: 'KR',
          keyword: asset.dartCorpCode,
          title: typeof item === 'object' && item && 'report_nm' in item ? String((item as { report_nm?: unknown }).report_nm) : 'OpenDART 공시',
          source: result.source,
          raw: item as Prisma.InputJsonValue,
        },
      });
      saved += 1;
    }
    if (result.data.length) {
      const labelSaved = await saveLabels({ assetId: asset.id, source: result.source, labels: [{ labelType: 'disclosure', labelKey: 'recent-filing', displayText: '최근 공시 있음', grade: 'normal', basis: 'OpenDART 공시 기준' }] });
      labels += labelSaved.saved;
    }
  }
  const skippedNoCorpCode = await prisma.asset.count({ where: { market: 'KR', isActive: true, dartCorpCode: null } });
  await recordProviderStatus({ provider: 'opendart', dataType: 'kr_disclosure', status: saved > 0 ? 'success' : 'partial', itemCount: saved, notes: `skippedNoCorpCode=${skippedNoCorpCode}` });
  return finishJob({ jobName: 'dart', ok: true, provider: 'opendart', startedAt, fetched, normalized: saved, saved: saved + labels, skipped: skippedNoCorpCode, failed: 0, missingEnv: [], errors: [], metadata: { assets: assets.length, skippedNoCorpCode } });
}
