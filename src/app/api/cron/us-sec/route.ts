import { runCronJob } from '@/lib/cron/cronRoute';
import { usSecJob } from '@/lib/jobs';

export async function GET(request: Request) {
  return runCronJob(request, 'us-sec', async () => ({ ...(await usSecJob()) }));
}
