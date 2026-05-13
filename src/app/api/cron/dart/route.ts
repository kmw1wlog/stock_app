import { runCronJob } from '@/lib/cron/cronRoute';
import { fetchOpenDartRecentFilings } from '@/lib/providers/korea/openDart';

export async function GET(request: Request) {
  return runCronJob(request, 'dart', async () => {
    const result = await fetchOpenDartRecentFilings('');
    return { source: result.source, count: Array.isArray(result.data) ? result.data.length : 0 };
  });
}
