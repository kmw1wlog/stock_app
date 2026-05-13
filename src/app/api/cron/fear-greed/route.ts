import { runCronJob } from '@/lib/cron/cronRoute';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { fetchAlternativeFearGreed } from '@/lib/providers/crypto/alternativeFearGreed';
import { saveLabels, saveProviderPayload } from '@/lib/providers/pipeline';

export async function GET(request: Request) {
  return runCronJob(request, 'fear-greed', async () => {
    const result = await fetchAlternativeFearGreed();
    const saved = await saveProviderPayload({ provider: result.source, cacheKey: 'MARKET:fear-greed', payload: result, ttlMinutes: 120 });
    let labels = 0;
    if (hasDatabaseUrl() && result.data) {
      const value = Number(result.data.value);
      const text = result.data.value_classification ?? 'Unknown';
      const assets = await prisma.asset.findMany({ where: { market: 'CRYPTO', isActive: true }, take: 200 });
      for (const asset of assets) {
        const labelSaved = await saveLabels({ assetId: asset.id, source: result.source, labels: [{ labelType: 'sentiment', labelKey: 'fear-greed', displayText: `공포탐욕 ${Number.isFinite(value) ? value : ''} ${text}`.trim(), grade: value >= 75 ? 'hot' : value <= 25 ? 'cold' : 'normal', basis: 'Alternative Fear & Greed 공개 API 기준' }] });
        labels += labelSaved.saved;
      }
    }
    return { source: result.source, data: result.data, saved, labels };
  });
}
