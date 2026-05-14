import type { Prisma } from '@prisma/client';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { startJob, finishJob, type JobResult } from '@/lib/jobs/types';
import { fetchNaverNewsMentions } from '@/lib/providers/korea/naverNews';
import { saveLabels, saveProviderPayload } from '@/lib/providers/pipeline';
import { recordProviderStatus } from '@/lib/providers/status';

export async function naverNewsJob(): Promise<JobResult> {
  const startedAt = startJob();
  const missingEnv = ['NAVER_CLIENT_ID', 'NAVER_CLIENT_SECRET'].filter((key) => !process.env[key]);
  if (missingEnv.length) {
    await recordProviderStatus({ provider: 'naver-news', dataType: 'news', status: 'missing_env', envMissing: missingEnv });
    return finishJob({ jobName: 'naver-news', ok: false, provider: 'naver-news', startedAt, fetched: 0, normalized: 0, saved: 0, skipped: 0, failed: 0, missingEnv, errors: [] });
  }
  if (!hasDatabaseUrl()) return finishJob({ jobName: 'naver-news', ok: false, provider: 'naver-news', startedAt, fetched: 0, normalized: 0, saved: 0, skipped: 0, failed: 1, missingEnv: ['DATABASE_URL'], errors: [{ message: 'DATABASE_URL missing' }] });

  const assets = await prisma.asset.findMany({ where: { isActive: true, market: 'KR' }, take: 20 });
  let fetched = 0;
  let saved = 0;
  let labels = 0;

  for (const asset of assets) {
    const query = [asset.name, asset.theme].filter(Boolean).join(' ') || asset.symbol;
    const result = await fetchNaverNewsMentions(query);
    fetched += 1;
    await saveProviderPayload({ provider: result.source, cacheKey: `${asset.market}:${asset.symbol}:news`, payload: result, ttlMinutes: 120 });
    for (const item of result.data) {
      await prisma.newsMention.create({
        data: {
          assetId: asset.id,
          market: asset.market,
          keyword: query,
          title: item.title,
          link: item.link,
          publishedAt: item.pubDate ? new Date(item.pubDate) : undefined,
          source: result.source,
          raw: item as Prisma.InputJsonValue,
        },
      });
      saved += 1;
    }
    if (result.data.length) {
      const labelSaved = await saveLabels({ assetId: asset.id, source: result.source, labels: [{ labelType: 'news', labelKey: 'recent-news', displayText: '뉴스 검색 결과 있음', grade: result.data.length >= 3 ? 'strong' : 'normal', basis: 'Naver 뉴스 검색 제목/링크 기준' }] });
      labels += labelSaved.saved;
    }
  }
  await recordProviderStatus({ provider: 'naver-news', dataType: 'news', status: saved > 0 ? 'success' : 'partial', itemCount: saved, notes: 'KR active assets limited to 20 to protect quota' });
  return finishJob({ jobName: 'naver-news', ok: true, provider: 'naver-news', startedAt, fetched, normalized: saved, saved: saved + labels, skipped: 0, failed: 0, missingEnv: [], errors: [], metadata: { assets: assets.length } });
}
