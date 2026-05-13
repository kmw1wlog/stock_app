import { runCronJob } from '@/lib/cron/cronRoute';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { buildUsLabels } from '@/lib/labels/usLabels';
import { saveDailyCandles, saveDailyQuote, saveLabels, saveProviderPayload } from '@/lib/providers/pipeline';
import { fetchUsDirectDailyCandles, fetchUsDirectQuote } from '@/lib/providers/us/usDirectProvider';

export async function GET(request: Request) {
  return runCronJob(request, 'us-direct-quotes', async () => {
    if (!hasDatabaseUrl()) return { source: 'us-direct', savedQuotes: 0, savedCandles: 0, skipped: 'DATABASE_URL missing' };
    if (!process.env.US_DIRECT_PRICE_PROVIDER || process.env.US_DIRECT_PRICE_PROVIDER === 'none') {
      return { source: 'us-direct', savedQuotes: 0, savedCandles: 0, skipped: 'US_DIRECT_PRICE_PROVIDER=none' };
    }

    const assets = await prisma.asset.findMany({ where: { market: 'US', isActive: true }, take: 200 });
    let savedQuotes = 0;
    let savedCandles = 0;
    let savedLabels = 0;
    let failed = 0;

    for (const asset of assets) {
      const quoteResult = await fetchUsDirectQuote(asset.symbol);
      await saveProviderPayload({ provider: quoteResult.source, cacheKey: `US:${asset.symbol}:direct-quote`, payload: quoteResult, ttlMinutes: 60 });
      if (quoteResult.data?.price) {
        await saveDailyQuote({ assetId: asset.id, quote: quoteResult.data });
        savedQuotes += 1;
        const labelResult = await saveLabels({ assetId: asset.id, source: quoteResult.source, labels: buildUsLabels({ market: 'US', quote: quoteResult.data }) });
        savedLabels += labelResult.saved;
      } else {
        failed += 1;
      }

      const candleResult = await fetchUsDirectDailyCandles(asset.symbol, 120);
      await saveProviderPayload({ provider: candleResult.source, cacheKey: `US:${asset.symbol}:direct-candles`, payload: candleResult, ttlMinutes: 360 });
      if (candleResult.data.length) {
        const candleSave = await saveDailyCandles({ assetId: asset.id, candles: candleResult.data, basis: candleResult.basis });
        savedCandles += candleSave.saved;
      }
    }

    return { source: process.env.US_DIRECT_PRICE_PROVIDER, assets: assets.length, savedQuotes, savedCandles, savedLabels, failed };
  });
}
