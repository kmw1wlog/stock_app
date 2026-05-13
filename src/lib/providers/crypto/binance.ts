import 'server-only';
import { emptyProviderResult, type NormalizedQuote, type ProviderResult } from '@/lib/providers/types';
import { safeFetchJson } from '@/lib/providers/http';

export async function fetchBinance24hTicker(symbol: string): Promise<ProviderResult<NormalizedQuote | null>> {
  const raw = await safeFetchJson<Record<string, string>>(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
  const quote: NormalizedQuote | null = raw
    ? {
        symbol,
        market: 'CRYPTO',
        price: Number(raw.lastPrice),
        changePct: Number(raw.priceChangePercent),
        volume: Number(raw.volume),
        amount: Number(raw.quoteVolume),
        basis: '24h 기준 · Binance public API',
        source: 'binance',
      }
    : null;
  return emptyProviderResult('binance', '24h 기준 · Binance public API', quote);
}
