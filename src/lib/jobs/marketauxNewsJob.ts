import type { Prisma } from '@prisma/client';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { startJob, finishJob, type JobResult } from '@/lib/jobs/types';
import { saveLabels, saveProviderPayload } from '@/lib/providers/pipeline';
import { fetchMarketauxNews } from '@/lib/providers/news/marketaux';
import { recordProviderStatus } from '@/lib/providers/status';

export async function marketauxNewsJob(): Promise<JobResult> {
  const startedAt = startJob();
  if (!process.env.MARKETAUX_API_TOKEN) {
    await recordProviderStatus({ provider: 'marketaux', dataType: 'news', status: 'missing_env', envMissing: ['MARKETAUX_API_TOKEN'] });
    return finishJob({ jobName: 'marketaux-news', ok: false, provider: 'marketaux', startedAt, fetched: 0, normalized: 0, saved: 0, skipped: 0, failed: 0, missingEnv: ['MARKETAUX_API_TOKEN'], errors: [] });
  }
  if (!hasDatabaseUrl()) return finishJob({ jobName: 'marketaux-news', ok: false, provider: 'marketaux', startedAt, fetched: 0, normalized: 0, saved: 0, skipped: 0, failed: 1, missingEnv: ['DATABASE_URL'], errors: [{ message: 'DATABASE_URL missing' }] });

  const assets = await prisma.asset.findMany({ where: { market: 'US', isActive: true }, take: 100 });
  let fetched = 0;
  let saved = 0;
  let labels = 0;

  for (const asset of assets) {
    const result = await fetchMarketauxNews(asset.symbol);
    fetched += 1;
    await saveProviderPayload({ provider: result.source, cacheKey: `US:${asset.symbol}:marketaux-news`, payload: result, ttlMinutes: 120 });
    for (const article of result.data) {
      if (!article.title && !article.url) continue;
      await prisma.newsMention.create({
        data: {
          assetId: asset.id,
          market: 'US',
          keyword: asset.symbol,
          title: article.title ?? `${asset.symbol} news`,
          link: article.url,
          publishedAt: article.published_at ? new Date(article.published_at) : undefined,
          source: result.source,
          raw: article as Prisma.InputJsonValue,
        },
      });
      saved += 1;
    }
    if (result.data.length) {
      const labelResult = await saveLabels({
        assetId: asset.id,
        source: result.source,
        labels: [{ labelType: 'news', labelKey: 'marketaux-news', displayText: 'Marketaux 뉴스 검색 결과 있음', grade: result.data.length >= 3 ? 'strong' : 'normal', basis: 'Marketaux 뉴스 제목/링크 기준' }],
      });
      labels += labelResult.saved;
    }
  }

  await recordProviderStatus({ provider: 'marketaux', dataType: 'news', status: saved > 0 ? 'success' : 'partial', itemCount: saved, notes: 'Marketaux title/link job' });
  return finishJob({ jobName: 'marketaux-news', ok: true, provider: 'marketaux', startedAt, fetched, normalized: saved, saved: saved + labels, skipped: 0, failed: 0, missingEnv: [], errors: [], metadata: { assets: assets.length } });
}
