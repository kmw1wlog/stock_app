import type { Prisma } from '@prisma/client';
import { runCronJob } from '@/lib/cron/cronRoute';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { fetchOpenDartRecentFilings } from '@/lib/providers/korea/openDart';
import { saveLabels, saveProviderPayload } from '@/lib/providers/pipeline';

export async function GET(request: Request) {
  return runCronJob(request, 'dart', async () => {
    if (!hasDatabaseUrl()) return { source: 'opendart', saved: 0, skipped: 'DATABASE_URL missing' };
    const assets = await prisma.asset.findMany({ where: { market: 'KR', isActive: true, dartCorpCode: { not: null } }, take: 150 });
    let saved = 0;
    let labels = 0;

    for (const asset of assets) {
      if (!asset.dartCorpCode) continue;
      const result = await fetchOpenDartRecentFilings(asset.dartCorpCode);
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
    return { source: 'opendart', assets: assets.length, saved, labels, skippedNoCorpCode };
  });
}
