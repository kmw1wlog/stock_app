import { runCronJob } from '@/lib/cron/cronRoute';
import { fetchKoreaEodQuote } from '@/lib/providers/korea/dataGoKr';

export async function GET(request: Request) {
  return runCronJob(request, 'korea-eod', async () => {
    const quote = await fetchKoreaEodQuote('277810');
    return { source: quote.source, basis: quote.basis, hasData: Boolean(quote.data) };
  });
}
