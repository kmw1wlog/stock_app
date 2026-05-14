import { runCronJob } from '@/lib/cron/cronRoute';
import { cryptoQuotesJob } from '@/lib/jobs';

export async function GET(request: Request) {
  return runCronJob(request, 'crypto-quotes', async () => ({ ...(await cryptoQuotesJob()) }));
}
