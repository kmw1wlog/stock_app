import { runCronJob } from '@/lib/cron/cronRoute';
import { koreaEodJob } from '@/lib/jobs';

export async function GET(request: Request) {
  return runCronJob(request, 'korea-eod', async () => ({ ...(await koreaEodJob()) }));
}
