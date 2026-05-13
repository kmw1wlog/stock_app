import type { Prisma } from '@prisma/client';
import { runCronJob } from '@/lib/cron/cronRoute';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { fetchNaverNewsMentions } from '@/lib/providers/korea/naverNews';
import { saveLabels, saveProviderPayload } from '@/lib/providers/pipeline';

export async function GET(request: Request) {
  return runCronJob(request, 'naver-news', async () => {
    if (!hasDatabaseUrl()) return { source: 'naver-news', saved: 0, skipped: 'DATABASE_URL missing' };
    const assets = await prisma.asset.findMany({ where: { isActive: true, OR: [{ market: 'KR' }, { market: 'US' }] }, take: 120 });
    let saved = 0;
    let labels = 0;

    for (const asset of assets) {
      const query = [asset.name, asset.theme].filter(Boolean).join(' ') || asset.symbol;
      const result = await fetchNaverNewsMentions(query);
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
    return { source: 'naver-news', assets: assets.length, saved, labels };
  });
}
