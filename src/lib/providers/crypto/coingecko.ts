import 'server-only';
import { emptyProviderResult } from '@/lib/providers/types';
import { safeFetchJson } from '@/lib/providers/http';

export async function fetchCoinGeckoMarket(coinId: string) {
  const url = new URL('https://api.coingecko.com/api/v3/simple/price');
  url.searchParams.set('ids', coinId);
  url.searchParams.set('vs_currencies', 'usd');
  url.searchParams.set('include_24hr_change', 'true');
  const headers: HeadersInit = {};
  if (process.env.COINGECKO_DEMO_API_KEY) {
    headers['x-cg-demo-api-key'] = process.env.COINGECKO_DEMO_API_KEY;
  }
  const raw = await safeFetchJson(url.toString(), { headers });
  return emptyProviderResult('coingecko', '24h 기준 · CoinGecko public/demo API', raw);
}
