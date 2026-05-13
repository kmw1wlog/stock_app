import 'server-only';
import { safeFetchJson } from '@/lib/providers/http';
import { emptyProviderResult, type NormalizedCandle, type NormalizedQuote } from '@/lib/providers/types';

export async function fetchUpbitTicker(market: string) {
  const raw = await safeFetchJson<Array<Record<string, number | string>>>(`https://api.upbit.com/v1/ticker?markets=${market}`);
  const item = raw?.[0];
  const quote: NormalizedQuote | null = item
    ? {
        symbol: market,
        market: 'CRYPTO',
        price: Number(item.trade_price),
        changePct: Number(item.signed_change_rate) * 100,
        volume: Number(item.acc_trade_volume_24h),
        amount: Number(item.acc_trade_price_24h),
        basis: '24h 기준 · Upbit public API',
        source: 'upbit',
      }
    : null;
  return emptyProviderResult('upbit', '24h 기준 · Upbit public API', quote);
}

export async function fetchUpbitCandles(market: string, interval = 'days', limit = 120) {
  const path = interval === 'minutes' ? 'minutes/60' : 'days';
  const raw = await safeFetchJson<Array<Record<string, number | string>>>(`https://api.upbit.com/v1/candles/${path}?market=${market}&count=${limit}`);
  const candles: NormalizedCandle[] = (raw ?? [])
    .map((item) => ({
      symbol: market,
      market: 'CRYPTO' as const,
      time: String(item.candle_date_time_utc),
      open: Number(item.opening_price),
      high: Number(item.high_price),
      low: Number(item.low_price),
      close: Number(item.trade_price),
      volume: Number(item.candle_acc_trade_volume),
      amount: Number(item.candle_acc_trade_price),
      source: 'upbit',
    }))
    .sort((a, b) => a.time.localeCompare(b.time));
  return emptyProviderResult('upbit', `${interval} candles · Upbit public API`, candles);
}
