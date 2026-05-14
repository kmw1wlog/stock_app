import { runCronJob } from '@/lib/cron/cronRoute';
import { naverNewsJob } from '@/lib/jobs';

export async function GET(request: Request) {
  return runCronJob(request, 'naver-news', async () => ({ ...(await naverNewsJob()) }));
}
