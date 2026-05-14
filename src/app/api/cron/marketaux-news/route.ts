import { runCronJob } from '@/lib/cron/cronRoute';
import { marketauxNewsJob } from '@/lib/jobs';

export async function GET(request: Request) {
  return runCronJob(request, 'marketaux-news', async () => ({ ...(await marketauxNewsJob()) }));
}
