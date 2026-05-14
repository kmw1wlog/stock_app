import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { startJob, finishJob, type JobResult } from '@/lib/jobs/types';
import { buildCryptoLabels } from '@/lib/labels/cryptoLabels';
import { fetchBinance24hTicker, fetchBinanceKlines } from '@/lib/providers/crypto/binance';
import { fetchUpbitCandles, fetchUpbitTicker } from '@/lib/providers/crypto/upbit';
import { saveDailyCandles, saveIntradayCandles, saveIntradayQuote, saveLabels, saveProviderPayload } from '@/lib/providers/pipeline';
import { recordProviderStatus } from '@/lib/providers/status';

export async function cryptoQuotesJob(): Promise<JobResult> {
  const startedAt = startJob();
  if (!hasDatabaseUrl()) {
    await recordProviderStatus({ provider: 'binance', dataType: 'crypto_24h_ticker', status: 'partial', notes: 'DATABASE_URL missing; provider can be smoke-tested but cannot persist' });
    return finishJob({ jobName: 'crypto-quotes', ok: false, provider: 'binance/upbit', startedAt, fetched: 0, normalized: 0, saved: 0, skipped: 0, failed: 1, missingEnv: ['DATABASE_URL'], errors: [{ message: 'DATABASE_URL missing' }] });
  }

  const assets = await prisma.asset.findMany({ where: { market: 'CRYPTO', isActive: true }, take: 300 });
  let fetched = 0;
  let normalized = 0;
  let saved = 0;
  let failed = 0;
  const errors: JobResult['errors'] = [];

  for (const asset of assets) {
    const quote = asset.binanceSymbol ? await fetchBinance24hTicker(asset.binanceSymbol) : asset.upbitMarket ? await fetchUpbitTicker(asset.upbitMarket) : null;
    if (quote) {
      fetched += 1;
      await saveProviderPayload({ provider: quote.source, cacheKey: `CRYPTO:${asset.symbol}:24h`, payload: quote, ttlMinutes: 60 });
      if (quote.data) {
        normalized += 1;
        const quoteSave = await saveIntradayQuote({ assetId: asset.id, quote: quote.data, interval: '24h' });
        saved += quoteSave.saved ? 1 : 0;
        const labelSave = await saveLabels({ assetId: asset.id, labels: buildCryptoLabels({ market: 'CRYPTO', quote: quote.data }), source: quote.source });
        saved += labelSave.saved;
      } else {
        failed += 1;
        errors.push({ symbol: asset.symbol, message: `${quote.source} returned no quote` });
      }
    } else {
      failed += 1;
      errors.push({ symbol: asset.symbol, message: 'No crypto quote provider configured for asset' });
    }

    const candles = asset.binanceSymbol ? await fetchBinanceKlines(asset.binanceSymbol, '1d', 120) : asset.upbitMarket ? await fetchUpbitCandles(asset.upbitMarket, 'days', 120) : null;
    if (candles?.data.length) {
      fetched += 1;
      normalized += candles.data.length;
      const daily = await saveDailyCandles({ assetId: asset.id, candles: candles.data, basis: candles.basis });
      const intraday = await saveIntradayCandles({ assetId: asset.id, candles: candles.data, interval: '1d' });
      saved += daily.saved + intraday.saved;
    }
  }

  await recordProviderStatus({ provider: 'binance', dataType: 'crypto_24h_ticker', status: saved > 0 ? 'success' : 'failed', itemCount: saved, lastError: errors[0]?.message, notes: 'Binance/Upbit crypto quote and candle job' });
  await recordProviderStatus({ provider: 'upbit', dataType: 'crypto_24h_ticker', status: saved > 0 ? 'success' : 'partial', itemCount: saved, lastError: errors[0]?.message, notes: 'Binance preferred; Upbit used when upbitMarket exists and binanceSymbol is absent' });

  return finishJob({ jobName: 'crypto-quotes', ok: saved > 0, provider: 'binance/upbit', startedAt, fetched, normalized, saved, skipped: 0, failed, missingEnv: [], errors, metadata: { assets: assets.length } });
}
