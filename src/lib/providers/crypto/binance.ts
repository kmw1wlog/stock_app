import 'server-only';
import { emptyProviderResult, type NormalizedCandle, type NormalizedQuote, type ProviderResult } from '@/lib/providers/types';
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

export async function fetchBinanceKlines(symbol: string, interval = '1d', limit = 120): Promise<ProviderResult<NormalizedCandle[]>> {
  const raw = await safeFetchJson<Array<Array<number | string>>>(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
  const candles = (raw ?? []).map((item) => ({
    symbol,
    market: 'CRYPTO' as const,
    time: new Date(Number(item[0])).toISOString(),
    open: Number(item[1]),
    high: Number(item[2]),
    low: Number(item[3]),
    close: Number(item[4]),
    volume: Number(item[5]),
    amount: Number(item[7]),
    source: 'binance',
  }));
  return emptyProviderResult('binance', `${interval} 캔들 · Binance public API`, candles);
}
