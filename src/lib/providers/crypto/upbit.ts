import 'server-only';
import { emptyProviderResult, type NormalizedQuote } from '@/lib/providers/types';
import { safeFetchJson } from '@/lib/providers/http';

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
