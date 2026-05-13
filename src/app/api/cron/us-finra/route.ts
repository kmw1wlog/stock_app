import { runCronJob } from '@/lib/cron/cronRoute';
import { fetchFinraShortVolume } from '@/lib/providers/us/finra';

export async function GET(request: Request) {
  return runCronJob(request, 'us-finra', async () => {
    const result = await fetchFinraShortVolume('AAPL');
    return { source: result.source, data: result.data };
  });
}
