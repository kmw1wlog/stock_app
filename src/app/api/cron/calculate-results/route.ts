import { runCronJob } from '@/lib/cron/cronRoute';

export async function GET(request: Request) {
  return runCronJob(request, 'calculate-results', async () => {
    return { calculatedSnapshots: 0, fallback: true };
  });
}
