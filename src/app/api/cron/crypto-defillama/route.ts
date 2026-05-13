import { runCronJob } from '@/lib/cron/cronRoute';
import { fetchDefiLlamaProtocol } from '@/lib/providers/crypto/defillama';

export async function GET(request: Request) {
  return runCronJob(request, 'crypto-defillama', async () => {
    const result = await fetchDefiLlamaProtocol('bitcoin');
    return { source: result.source, hasData: Boolean(result.data) };
  });
}
