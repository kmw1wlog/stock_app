import { runCronJob } from '@/lib/cron/cronRoute';
import { fetchFinraShortVolume } from '@/lib/providers/us/finra';
import { saveProviderPayload } from '@/lib/providers/pipeline';

export async function GET(request: Request) {
  return runCronJob(request, 'us-finra', async () => {
    const result = await fetchFinraShortVolume('AAPL');
    const saved = await saveProviderPayload({ provider: result.source, cacheKey: 'US:AAPL:finra-short-volume', payload: result });
    return { source: result.source, data: result.data, saved };
  });
}
