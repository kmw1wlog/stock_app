import { runCronJob } from '@/lib/cron/cronRoute';
import { fetchSecCompanySubmissions } from '@/lib/providers/us/secEdgar';
import { saveProviderPayload } from '@/lib/providers/pipeline';

export async function GET(request: Request) {
  return runCronJob(request, 'us-sec', async () => {
    const result = await fetchSecCompanySubmissions('0000320193');
    const saved = await saveProviderPayload({ provider: result.source, cacheKey: 'US:AAPL:sec', payload: result });
    return { source: result.source, hasData: Boolean(result.data), saved };
  });
}
