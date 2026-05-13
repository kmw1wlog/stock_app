import { runCronJob } from '@/lib/cron/cronRoute';
import { fetchAlternativeFearGreed } from '@/lib/providers/crypto/alternativeFearGreed';
import { saveProviderPayload } from '@/lib/providers/pipeline';

export async function GET(request: Request) {
  return runCronJob(request, 'fear-greed', async () => {
    const result = await fetchAlternativeFearGreed();
    const saved = await saveProviderPayload({ provider: result.source, cacheKey: 'MARKET:fear-greed', payload: result });
    return { source: result.source, data: result.data, saved };
  });
}
