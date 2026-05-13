import type { Prisma } from '@prisma/client';
import { runCronJob } from '@/lib/cron/cronRoute';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { saveLabels, saveProviderPayload } from '@/lib/providers/pipeline';
import { fetchMarketauxNews } from '@/lib/providers/news/marketaux';

export async function GET(request: Request) {
  return runCronJob(request, 'marketaux-news', async () => {
    if (!hasDatabaseUrl()) return { source: 'marketaux', saved: 0, skipped: 'DATABASE_URL missing' };
    if (!process.env.MARKETAUX_API_TOKEN) return { source: 'marketaux', saved: 0, skipped: 'MARKETAUX_API_TOKEN missing' };

    const assets = await prisma.asset.findMany({ where: { market: 'US', isActive: true }, take: 100 });
    let saved = 0;
    let labels = 0;

    for (const asset of assets) {
      const result = await fetchMarketauxNews(asset.symbol);
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

    return { source: 'marketaux', assets: assets.length, saved, labels };
  });
}
