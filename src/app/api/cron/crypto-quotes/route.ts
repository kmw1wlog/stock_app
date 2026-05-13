import { runCronJob } from '@/lib/cron/cronRoute';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { buildCryptoLabels } from '@/lib/labels/cryptoLabels';
import { fetchBinance24hTicker, fetchBinanceKlines } from '@/lib/providers/crypto/binance';
import { fetchUpbitCandles, fetchUpbitTicker } from '@/lib/providers/crypto/upbit';
import { saveDailyCandles, saveIntradayCandles, saveIntradayQuote, saveLabels, saveProviderPayload } from '@/lib/providers/pipeline';

export async function GET(request: Request) {
  return runCronJob(request, 'crypto-quotes', async () => {
    if (!hasDatabaseUrl()) return { source: 'binance/upbit', saved: 0, skipped: 'DATABASE_URL missing' };
    const assets = await prisma.asset.findMany({ where: { market: 'CRYPTO', isActive: true }, take: 300 });
    let quotesSaved = 0;
    let candlesSaved = 0;
    const failures: string[] = [];

    for (const asset of assets) {
      const quote = asset.binanceSymbol ? await fetchBinance24hTicker(asset.binanceSymbol) : asset.upbitMarket ? await fetchUpbitTicker(asset.upbitMarket) : null;
      if (quote) {
        await saveProviderPayload({ provider: quote.source, cacheKey: `CRYPTO:${asset.symbol}:24h`, payload: quote, ttlMinutes: 60 });
        if (quote.data) {
          const saved = await saveIntradayQuote({ assetId: asset.id, quote: quote.data, interval: '24h' });
          quotesSaved += saved.saved ? 1 : 0;
          await saveLabels({ assetId: asset.id, labels: buildCryptoLabels({ market: 'CRYPTO', quote: quote.data }), source: quote.source });
        } else {
          failures.push(asset.symbol);
        }
      } else {
        failures.push(asset.symbol);
      }

      const candles = asset.binanceSymbol ? await fetchBinanceKlines(asset.binanceSymbol, '1d', 120) : asset.upbitMarket ? await fetchUpbitCandles(asset.upbitMarket, 'days', 120) : null;
      if (candles?.data.length) {
        const daily = await saveDailyCandles({ assetId: asset.id, candles: candles.data, basis: candles.basis });
        const intraday = await saveIntradayCandles({ assetId: asset.id, candles: candles.data, interval: '1d' });
        candlesSaved += daily.saved + intraday.saved;
      }
    }

    return { source: 'binance/upbit', assets: assets.length, quotesSaved, candlesSaved, failures };
  });
}
