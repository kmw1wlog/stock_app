import { runCronJob } from '@/lib/cron/cronRoute';
import { usDirectQuotesJob } from '@/lib/jobs';

export async function GET(request: Request) {
  return runCronJob(request, 'us-direct-quotes', async () => ({ ...(await usDirectQuotesJob()) }));
}
