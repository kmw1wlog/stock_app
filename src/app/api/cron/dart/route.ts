import { runCronJob } from '@/lib/cron/cronRoute';
import { dartJob } from '@/lib/jobs';

export async function GET(request: Request) {
  return runCronJob(request, 'dart', async () => ({ ...(await dartJob()) }));
}
