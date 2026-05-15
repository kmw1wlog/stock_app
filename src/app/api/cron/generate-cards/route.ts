import { runCronJob } from '@/lib/cron/cronRoute';
import { generateCardsJob } from '@/lib/jobs';

export async function GET(request: Request) {
  return runCronJob(request, 'generate-cards', async () => ({ ...(await generateCardsJob()) }));
}
