import { runCronJob } from '@/lib/cron/cronRoute';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { buildKoreaLabels } from '@/lib/labels/koreaLabels';
import { fetchKoreaDailyCandles, fetchKoreaEodQuote } from '@/lib/providers/korea/dataGoKr';
import { saveDailyCandles, saveDailyQuote, saveLabels, saveProviderPayload } from '@/lib/providers/pipeline';

export async function GET(request: Request) {
  return runCronJob(request, 'korea-eod', async () => {
    if (!hasDatabaseUrl()) return { source: 'data.go.kr', saved: 0, skipped: 'DATABASE_URL missing' };
    const assets = await prisma.asset.findMany({ where: { market: 'KR', isActive: true }, take: 300 });
    let quoteSaved = 0;
    let candleSaved = 0;
    const failures: string[] = [];

    for (const asset of assets) {
      const symbol = asset.dataGoKrCode ?? asset.symbol;
      const quote = await fetchKoreaEodQuote(symbol);
      await saveProviderPayload({ provider: quote.source, cacheKey: `KR:${symbol}:eod`, payload: quote, ttlMinutes: 1440 });
      if (quote.data) {
        const saved = await saveDailyQuote({ assetId: asset.id, quote: quote.data });
        quoteSaved += saved.saved ? 1 : 0;
        await saveLabels({ assetId: asset.id, labels: buildKoreaLabels({ market: 'KR', quote: quote.data }), source: quote.source });
      } else {
        failures.push(symbol);
      }

      const candles = await fetchKoreaDailyCandles(symbol, 120);
      if (candles.data.length) {
        const saved = await saveDailyCandles({ assetId: asset.id, candles: candles.data, basis: candles.basis });
        candleSaved += saved.saved;
      }
    }

    return { source: 'data.go.kr', assets: assets.length, quoteSaved, candleSaved, failures };
  });
}
