import type { Prisma } from '@prisma/client';
import { runCronJob } from '@/lib/cron/cronRoute';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { fetchOpenDartRecentFilings } from '@/lib/providers/korea/openDart';
import { ensureAsset, saveProviderPayload } from '@/lib/providers/pipeline';

export async function GET(request: Request) {
  return runCronJob(request, 'dart', async () => {
    const corpCode = '00126380';
    const result = await fetchOpenDartRecentFilings(corpCode);
    const asset = await ensureAsset({ market: 'KR', symbol: '005930', name: '삼성전자', theme: '반도체' });
    await saveProviderPayload({ provider: result.source, cacheKey: `KR:${corpCode}:dart`, payload: result });

    let saved = 0;
    if (hasDatabaseUrl() && !asset.fallback) {
      for (const item of result.data) {
        await prisma.newsMention.create({
          data: {
            assetId: asset.id,
            market: 'KR',
            keyword: corpCode,
            title: typeof item === 'object' && item && 'report_nm' in item ? String((item as { report_nm?: unknown }).report_nm) : 'OpenDART event',
            source: result.source,
            raw: item as Prisma.InputJsonValue,
          },
        });
        saved += 1;
      }
    }

    return { source: result.source, corpCode, count: Array.isArray(result.data) ? result.data.length : 0, saved, fallback: !hasDatabaseUrl() };
  });
}
