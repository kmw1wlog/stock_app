import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { startJob, finishJob, type JobResult } from '@/lib/jobs/types';
import { buildKoreaLabels } from '@/lib/labels/koreaLabels';
import { fetchKoreaDailyCandles, fetchKoreaEodQuote } from '@/lib/providers/korea/dataGoKr';
import { saveDailyCandles, saveDailyQuote, saveLabels, saveProviderPayload } from '@/lib/providers/pipeline';
import { recordProviderStatus } from '@/lib/providers/status';

export async function koreaEodJob(): Promise<JobResult> {
  const startedAt = startJob();
  if (!process.env.DATA_GO_KR_SERVICE_KEY) {
    await recordProviderStatus({ provider: 'data.go.kr', dataType: 'kr_eod', status: 'missing_env', envMissing: ['DATA_GO_KR_SERVICE_KEY'], notes: 'Data.go.kr service key required' });
    return finishJob({ jobName: 'korea-eod', ok: false, provider: 'data.go.kr', startedAt, fetched: 0, normalized: 0, saved: 0, skipped: 0, failed: 0, missingEnv: ['DATA_GO_KR_SERVICE_KEY'], errors: [] });
  }
  if (!hasDatabaseUrl()) return finishJob({ jobName: 'korea-eod', ok: false, provider: 'data.go.kr', startedAt, fetched: 0, normalized: 0, saved: 0, skipped: 0, failed: 1, missingEnv: ['DATABASE_URL'], errors: [{ message: 'DATABASE_URL missing' }] });

  const assets = await prisma.asset.findMany({ where: { market: 'KR', isActive: true }, take: 300 });
  let fetched = 0;
  let normalized = 0;
  let saved = 0;
  let failed = 0;
  const errors: JobResult['errors'] = [];

  for (const asset of assets) {
    const symbol = asset.dataGoKrCode ?? asset.symbol;
    const quote = await fetchKoreaEodQuote(symbol);
    fetched += 1;
    await saveProviderPayload({ provider: quote.source, cacheKey: `KR:${symbol}:eod`, payload: quote, ttlMinutes: 1440 });
    if (quote.data) {
      normalized += 1;
      const quoteSave = await saveDailyQuote({ assetId: asset.id, quote: quote.data });
      saved += quoteSave.saved ? 1 : 0;
      const labelSave = await saveLabels({ assetId: asset.id, labels: buildKoreaLabels({ market: 'KR', quote: quote.data }), source: quote.source });
      saved += labelSave.saved;
    } else {
      failed += 1;
      errors.push({ symbol, message: 'Data.go.kr quote returned no item' });
    }

    const candles = await fetchKoreaDailyCandles(symbol, 120);
    if (candles.data.length) {
      normalized += candles.data.length;
      const candleSave = await saveDailyCandles({ assetId: asset.id, candles: candles.data, basis: candles.basis });
      saved += candleSave.saved;
    }
  }

  await recordProviderStatus({ provider: 'data.go.kr', dataType: 'kr_eod', status: saved > 0 ? 'success' : 'failed', itemCount: saved, lastError: errors[0]?.message, notes: 'KR EOD quote/candle job' });
  return finishJob({ jobName: 'korea-eod', ok: saved > 0, provider: 'data.go.kr', startedAt, fetched, normalized, saved, skipped: 0, failed, missingEnv: [], errors, metadata: { assets: assets.length } });
}
