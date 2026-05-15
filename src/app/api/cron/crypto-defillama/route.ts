import { runCronJob } from '@/lib/cron/cronRoute';
import { fetchDefiLlamaProtocol } from '@/lib/providers/crypto/defillama';
import { saveProviderPayload } from '@/lib/providers/pipeline';

export async function GET(request: Request) {
  return runCronJob(request, 'crypto-defillama', async () => {
    const result = await fetchDefiLlamaProtocol('bitcoin');
    const saved = await saveProviderPayload({ provider: result.source, cacheKey: 'CRYPTO:bitcoin:defillama', payload: result });
    return { source: result.source, hasData: Boolean(result.data), saved };
  });
}
