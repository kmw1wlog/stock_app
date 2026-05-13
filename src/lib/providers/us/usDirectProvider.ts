import 'server-only';
import { emptyProviderResult, type NormalizedQuote } from '@/lib/providers/types';
import { safeFetchJson } from '@/lib/providers/http';

export async function fetchUsDirectQuote(symbol: string) {
  const provider = process.env.US_DIRECT_PRICE_PROVIDER;
  if (provider === 'twelveData' && process.env.TWELVE_DATA_API_KEY) {
    const url = new URL('https://api.twelvedata.com/quote');
    url.searchParams.set('symbol', symbol);
    url.searchParams.set('apikey', process.env.TWELVE_DATA_API_KEY);
    const raw = await safeFetchJson<Record<string, string>>(url.toString());
    const quote: NormalizedQuote | null = raw
      ? {
          symbol,
          market: 'US',
          price: Number(raw.close),
          changePct: Number(raw.percent_change),
          volume: Number(raw.volume),
          basis: '직접 API · Twelve Data',
          source: 'twelveData',
        }
      : null;
    return emptyProviderResult('twelveData', '직접 API · Twelve Data', quote);
  }
  return emptyProviderResult('us-direct', 'US_DIRECT_PRICE_PROVIDER=none · widget only', null);
}
