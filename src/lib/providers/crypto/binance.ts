import 'server-only';
import { safeProviderFetch } from '@/lib/providers/http';
import { emptyProviderResult, type NormalizedCandle, type NormalizedQuote, type ProviderResult } from '@/lib/providers/types';

const hosts = ['https://api.binance.com', 'https://data-api.binance.vision'];

async function fetchFromBinance<T>(path: string, basis: string) {
  let last = null;
  for (const host of hosts) {
    const outcome = await safeProviderFetch<T>({ provider: 'binance', url: `${host}${path}`, basis, retries: 1 });
    if (outcome.ok) return outcome;
    last = outcome;
  }
  return last;
}

export async function fetchBinance24hTicker(symbol: string): Promise<ProviderResult<NormalizedQuote | null>> {
  const basis = '24h 기준 · Binance public API';
  const outcome = await fetchFromBinance<Record<string, string>>(`/api/v3/ticker/24hr?symbol=${symbol}`, basis);
  const raw = outcome?.data;
  const quote: NormalizedQuote | null = raw
    ? {
        symbol,
        market: 'CRYPTO',
        price: Number(raw.lastPrice),
        changePct: Number(raw.priceChangePercent),
        volume: Number(raw.volume),
        amount: Number(raw.quoteVolume),
        basis,
        source: 'binance',
      }
    : null;
  return { ...emptyProviderResult('binance', basis, quote), raw: outcome };
}

export async function fetchBinanceKlines(symbol: string, interval = '1d', limit = 120): Promise<ProviderResult<NormalizedCandle[]>> {
  const basis = `${interval} 캔들 · Binance public API`;
  const outcome = await fetchFromBinance<Array<Array<number | string>>>(`/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`, basis);
  const candles = (outcome?.data ?? []).map((item) => ({
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
  return { ...emptyProviderResult('binance', basis, candles), raw: outcome };
}
