import type { Prisma } from '@prisma/client';
import { runCronJob } from '@/lib/cron/cronRoute';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { fetchNaverNewsMentions } from '@/lib/providers/korea/naverNews';
import { ensureAsset, saveProviderPayload } from '@/lib/providers/pipeline';

export async function GET(request: Request) {
  return runCronJob(request, 'naver-news', async () => {
    const result = await fetchNaverNewsMentions('로봇 테마');
    const asset = await ensureAsset({ market: 'KR', symbol: '277810', name: '레인보우로보틱스', theme: '로봇' });
    await saveProviderPayload({ provider: result.source, cacheKey: 'KR:robot:news', payload: result });

    let saved = 0;
    if (hasDatabaseUrl() && !asset.fallback) {
      for (const item of result.data) {
        await prisma.newsMention.create({
          data: {
            assetId: asset.id,
            market: 'KR',
            keyword: '로봇 테마',
            title: item.title,
            link: item.link,
            publishedAt: item.pubDate ? new Date(item.pubDate) : undefined,
            source: result.source,
            raw: item as Prisma.InputJsonValue,
          },
        });
        saved += 1;
      }
    }

    return { source: result.source, count: result.data.length, saved, fallback: !hasDatabaseUrl() };
  });
}
