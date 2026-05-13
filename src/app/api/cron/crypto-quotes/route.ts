import { runCronJob } from '@/lib/cron/cronRoute';
import { fetchBinance24hTicker } from '@/lib/providers/crypto/binance';

export async function GET(request: Request) {
  return runCronJob(request, 'crypto-quotes', async () => {
    const result = await fetchBinance24hTicker('BTCUSDT');
    return { source: result.source, hasData: Boolean(result.data) };
  });
}
