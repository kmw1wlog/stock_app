import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { startJob, finishJob, type JobResult } from '@/lib/jobs/types';
import { buildUsLabels } from '@/lib/labels/usLabels';
import { saveDailyCandles, saveDailyQuote, saveLabels, saveProviderPayload } from '@/lib/providers/pipeline';
import { recordProviderStatus } from '@/lib/providers/status';
import { fetchUsDirectDailyCandles, fetchUsDirectQuote } from '@/lib/providers/us/usDirectProvider';

function missingForProvider(provider?: string) {
  if (!provider || provider === 'none') return [];
  if (provider === 'alpaca') return ['ALPACA_API_KEY_ID', 'ALPACA_API_SECRET_KEY'].filter((key) => !process.env[key]);
  if (provider === 'fmp') return ['FMP_API_KEY'].filter((key) => !process.env[key]);
  if (provider === 'alphaVantage') return ['ALPHA_VANTAGE_API_KEY'].filter((key) => !process.env[key]);
  if (provider === 'twelveData') return ['TWELVE_DATA_API_KEY'].filter((key) => !process.env[key]);
  return [];
}

export async function usDirectQuotesJob(): Promise<JobResult> {
  const startedAt = startJob();
  const provider = process.env.US_DIRECT_PRICE_PROVIDER;
  if (!provider || provider === 'none') {
    return finishJob({ jobName: 'us-direct-quotes', ok: true, provider: 'us-direct', startedAt, fetched: 0, normalized: 0, saved: 0, skipped: 1, failed: 0, missingEnv: [], errors: [], metadata: { skipped: 'US_DIRECT_PRICE_PROVIDER=none' } });
  }
  const missingEnv = missingForProvider(provider);
  if (missingEnv.length) {
    await recordProviderStatus({ provider, dataType: 'us_quote', status: 'missing_env', envMissing: missingEnv });
    return finishJob({ jobName: 'us-direct-quotes', ok: false, provider, startedAt, fetched: 0, normalized: 0, saved: 0, skipped: 0, failed: 0, missingEnv, errors: [] });
  }
  if (!hasDatabaseUrl()) return finishJob({ jobName: 'us-direct-quotes', ok: false, provider, startedAt, fetched: 0, normalized: 0, saved: 0, skipped: 0, failed: 1, missingEnv: ['DATABASE_URL'], errors: [{ message: 'DATABASE_URL missing' }] });

  const assets = await prisma.asset.findMany({ where: { market: 'US', isActive: true }, take: 200 });
  let fetched = 0;
  let normalized = 0;
  let saved = 0;
  let failed = 0;
  const errors: JobResult['errors'] = [];

  for (const asset of assets) {
    const quoteResult = await fetchUsDirectQuote(asset.symbol);
    fetched += 1;
    await saveProviderPayload({ provider: quoteResult.source, cacheKey: `US:${asset.symbol}:direct-quote`, payload: quoteResult, ttlMinutes: 60 });
    if (quoteResult.data?.price) {
      normalized += 1;
      const quoteSave = await saveDailyQuote({ assetId: asset.id, quote: quoteResult.data });
      saved += quoteSave.saved ? 1 : 0;
      const labelResult = await saveLabels({ assetId: asset.id, source: quoteResult.source, labels: buildUsLabels({ market: 'US', quote: quoteResult.data }) });
      saved += labelResult.saved;
    } else {
      failed += 1;
      errors.push({ symbol: asset.symbol, message: `${quoteResult.source} returned no direct quote` });
    }

    const candleResult = await fetchUsDirectDailyCandles(asset.symbol, 120);
    fetched += 1;
    await saveProviderPayload({ provider: candleResult.source, cacheKey: `US:${asset.symbol}:direct-candles`, payload: candleResult, ttlMinutes: 360 });
    if (candleResult.data.length) {
      normalized += candleResult.data.length;
      const candleSave = await saveDailyCandles({ assetId: asset.id, candles: candleResult.data, basis: candleResult.basis });
      saved += candleSave.saved;
    }
  }

  await recordProviderStatus({ provider, dataType: 'us_quote', status: saved > 0 ? 'success' : 'failed', itemCount: saved, lastError: errors[0]?.message, notes: 'US direct quote/candle job' });
  return finishJob({ jobName: 'us-direct-quotes', ok: saved > 0, provider, startedAt, fetched, normalized, saved, skipped: 0, failed, missingEnv: [], errors, metadata: { assets: assets.length } });
}
