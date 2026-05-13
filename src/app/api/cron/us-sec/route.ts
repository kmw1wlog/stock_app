import { runCronJob } from '@/lib/cron/cronRoute';
import { fetchSecCompanySubmissions } from '@/lib/providers/us/secEdgar';

export async function GET(request: Request) {
  return runCronJob(request, 'us-sec', async () => {
    const result = await fetchSecCompanySubmissions('0000320193');
    return { source: result.source, hasData: Boolean(result.data) };
  });
}
