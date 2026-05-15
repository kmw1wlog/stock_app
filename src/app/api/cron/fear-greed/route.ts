import { runCronJob } from '@/lib/cron/cronRoute';
import { fearGreedJob } from '@/lib/jobs';

export async function GET(request: Request) {
  return runCronJob(request, 'fear-greed', async () => ({ ...(await fearGreedJob()) }));
}
