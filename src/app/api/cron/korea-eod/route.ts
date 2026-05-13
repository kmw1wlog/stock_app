import { runCronJob } from '@/lib/cron/cronRoute';
import { buildKoreaLabels } from '@/lib/labels/koreaLabels';
import { fetchKoreaEodQuote } from '@/lib/providers/korea/dataGoKr';
import { ensureAsset, saveDailyQuote, saveLabels, saveProviderPayload } from '@/lib/providers/pipeline';

export async function GET(request: Request) {
  return runCronJob(request, 'korea-eod', async () => {
    const result = await fetchKoreaEodQuote('277810');
    const asset = await ensureAsset({ market: 'KR', symbol: '277810', name: '레인보우로보틱스', theme: '로봇', tvSymbol: 'KRX:277810' });
    await saveProviderPayload({ provider: result.source, cacheKey: 'KR:277810:eod', payload: result });

    let priceSaved = { saved: false, fallback: true };
    if (!asset.fallback && result.data) {
      priceSaved = await saveDailyQuote({ assetId: asset.id, quote: result.data });
    }

    const labels = buildKoreaLabels({ market: 'KR', quote: result.data, newsCount: 3, communityScore: 70, volumeRatio: 2 });
    const labelSaved = asset.fallback ? { saved: 0, fallback: true } : await saveLabels({ assetId: asset.id, labels, source: result.source });

    return { source: result.source, basis: result.basis, hasData: Boolean(result.data), asset, priceSaved, labelSaved };
  });
}
