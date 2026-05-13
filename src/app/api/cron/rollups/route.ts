import { runCronJob } from '@/lib/cron/cronRoute';

export async function GET(request: Request) {
  return runCronJob(request, 'rollups', async () => {
    return { rollups: 0, fallback: true };
  });
}
