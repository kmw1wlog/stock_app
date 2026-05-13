import { runCronJob } from '@/lib/cron/cronRoute';
import { fetchBinance24hTicker } from '@/lib/providers/crypto/binance';
import { buildCryptoLabels } from '@/lib/labels/cryptoLabels';
import { ensureAsset, saveLabels, saveProviderPayload } from '@/lib/providers/pipeline';

export async function GET(request: Request) {
  return runCronJob(request, 'crypto-quotes', async () => {
    const result = await fetchBinance24hTicker('BTCUSDT');
    const asset = await ensureAsset({ market: 'CRYPTO', symbol: 'BTC', name: 'Bitcoin', theme: '대형코인', tvSymbol: 'BINANCE:BTCUSDT', coingeckoId: 'bitcoin', binanceSymbol: 'BTCUSDT' });
    await saveProviderPayload({ provider: result.source, cacheKey: 'CRYPTO:BTCUSDT:24h', payload: result });
    const labels = buildCryptoLabels({ market: 'CRYPTO', quote: result.data, newsCount: 0, communityScore: 60, volumeRatio: 2 });
    const labelSaved = asset.fallback ? { saved: 0, fallback: true } : await saveLabels({ assetId: asset.id, labels, source: result.source });
    return { source: result.source, hasData: Boolean(result.data), asset, labelSaved };
  });
}
