import { runCronJob } from '@/lib/cron/cronRoute';
import { fetchAlternativeFearGreed } from '@/lib/providers/crypto/alternativeFearGreed';

export async function GET(request: Request) {
  return runCronJob(request, 'fear-greed', async () => {
    const result = await fetchAlternativeFearGreed();
    return { source: result.source, data: result.data };
  });
}
