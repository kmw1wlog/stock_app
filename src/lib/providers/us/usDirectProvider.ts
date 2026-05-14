import 'server-only';
import { safeFetchJson } from '@/lib/providers/http';
import { emptyProviderResult, type NormalizedCandle, type NormalizedQuote } from '@/lib/providers/types';

type AlpacaSnapshot = {
  dailyBar?: { c?: number; v?: number; h?: number; l?: number; o?: number; t?: string };
  prevDailyBar?: { c?: number };
};

function numberOrUndefined(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function changePct(close?: number, previousClose?: number) {
  if (!close || !previousClose) return undefined;
  return ((close - previousClose) / previousClose) * 100;
}

function alpacaHeaders() {
  const key = process.env.ALPACA_API_KEY_ID;
  const secret = process.env.ALPACA_API_SECRET_KEY;
  if (!key || !secret) return null;
  return { 'APCA-API-KEY-ID': key, 'APCA-API-SECRET-KEY': secret };
}

export async function fetchUsDirectQuote(symbol: string) {
  const provider = process.env.US_DIRECT_PRICE_PROVIDER;

  if (provider === 'alpaca') {
    const headers = alpacaHeaders();
    if (!headers) return emptyProviderResult('alpaca', 'Alpaca API 키 필요', null);
    const base = process.env.ALPACA_DATA_BASE_URL || 'https://data.alpaca.markets/v2';
    const raw = await safeFetchJson<AlpacaSnapshot>(`${base}/stocks/${symbol}/snapshot`, { headers });
    const close = numberOrUndefined(raw?.dailyBar?.c);
    const previousClose = numberOrUndefined(raw?.prevDailyBar?.c);
    const quote: NormalizedQuote | null = close
      ? {
          symbol,
          market: 'US',
          price: close,
          changePct: changePct(close, previousClose),
          volume: numberOrUndefined(raw?.dailyBar?.v),
          basis: 'Alpaca market data · daily snapshot',
          source: 'alpaca',
        }
      : null;
    return emptyProviderResult('alpaca', 'Alpaca market data · daily snapshot', quote);
  }

  if (provider === 'fmp' && process.env.FMP_API_KEY) {
    const url = new URL('https://financialmodelingprep.com/stable/quote');
    url.searchParams.set('symbol', symbol);
    url.searchParams.set('apikey', process.env.FMP_API_KEY);
    const raw = await safeFetchJson<Array<Record<string, number | string>>>(url.toString());
    const item = raw?.[0];
    const quote: NormalizedQuote | null = item
      ? {
          symbol,
          market: 'US',
          price: numberOrUndefined(item.price),
          changePct: numberOrUndefined(item.changePercentage ?? item.changesPercentage),
          volume: numberOrUndefined(item.volume),
          basis: 'FMP quote API',
          source: 'fmp',
        }
      : null;
    return emptyProviderResult('fmp', 'FMP quote API', quote);
  }

  if (provider === 'alphaVantage' && process.env.ALPHA_VANTAGE_API_KEY) {
    const url = new URL('https://www.alphavantage.co/query');
    url.searchParams.set('function', 'GLOBAL_QUOTE');
    url.searchParams.set('symbol', symbol);
    url.searchParams.set('apikey', process.env.ALPHA_VANTAGE_API_KEY);
    const raw = await safeFetchJson<Record<string, Record<string, string>>>(url.toString());
    const item = raw?.['Global Quote'];
    const quote: NormalizedQuote | null = item
      ? {
          symbol,
          market: 'US',
          price: numberOrUndefined(item['05. price']),
          changePct: numberOrUndefined(String(item['10. change percent'] ?? '').replace('%', '')),
          volume: numberOrUndefined(item['06. volume']),
          basis: 'Alpha Vantage Global Quote',
          source: 'alphaVantage',
        }
      : null;
    return emptyProviderResult('alphaVantage', 'Alpha Vantage Global Quote', quote);
  }

  if (provider === 'twelveData' && process.env.TWELVE_DATA_API_KEY) {
    const url = new URL('https://api.twelvedata.com/quote');
    url.searchParams.set('symbol', symbol);
    url.searchParams.set('apikey', process.env.TWELVE_DATA_API_KEY);
    const raw = await safeFetchJson<Record<string, string>>(url.toString());
    const quote: NormalizedQuote | null = raw
      ? {
          symbol,
          market: 'US',
          price: numberOrUndefined(raw.close),
          changePct: numberOrUndefined(raw.percent_change),
          volume: numberOrUndefined(raw.volume),
          basis: 'Twelve Data quote API',
          source: 'twelveData',
        }
      : null;
    return emptyProviderResult('twelveData', 'Twelve Data quote API', quote);
  }

  return emptyProviderResult('us-direct', 'US_DIRECT_PRICE_PROVIDER=none · widget only', null);
}

export async function fetchUsDirectDailyCandles(symbol: string, limit = 120) {
  const provider = process.env.US_DIRECT_PRICE_PROVIDER;

  if (provider === 'alpaca') {
    const headers = alpacaHeaders();
    if (!headers) return emptyProviderResult('alpaca', 'Alpaca API 키 필요', []);
    const base = process.env.ALPACA_DATA_BASE_URL || 'https://data.alpaca.markets/v2';
    const url = new URL(`${base}/stocks/${symbol}/bars`);
    url.searchParams.set('timeframe', '1Day');
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('adjustment', 'raw');
    const raw = await safeFetchJson<{ bars?: Array<{ t: string; o?: number; h?: number; l?: number; c?: number; v?: number }> }>(url.toString(), { headers });
    const candles: NormalizedCandle[] = (raw?.bars ?? []).map((bar) => ({
      symbol,
      market: 'US',
      time: bar.t,
      open: bar.o,
      high: bar.h,
      low: bar.l,
      close: bar.c,
      volume: bar.v,
      source: 'alpaca',
    }));
    return emptyProviderResult('alpaca', 'Alpaca market data · 1Day bars', candles);
  }

  if (provider === 'twelveData' && process.env.TWELVE_DATA_API_KEY) {
    const url = new URL('https://api.twelvedata.com/time_series');
    url.searchParams.set('symbol', symbol);
    url.searchParams.set('interval', '1day');
    url.searchParams.set('outputsize', String(limit));
    url.searchParams.set('apikey', process.env.TWELVE_DATA_API_KEY);
    const raw = await safeFetchJson<{ values?: Array<Record<string, string>> }>(url.toString());
    const candles: NormalizedCandle[] = (raw?.values ?? [])
      .map((item) => ({
        symbol,
        market: 'US' as const,
        time: item.datetime,
        open: numberOrUndefined(item.open),
        high: numberOrUndefined(item.high),
        low: numberOrUndefined(item.low),
        close: numberOrUndefined(item.close),
        volume: numberOrUndefined(item.volume),
        source: 'twelveData',
      }))
      .sort((a, b) => a.time.localeCompare(b.time));
    return emptyProviderResult('twelveData', 'Twelve Data 1day candles', candles);
  }

  return emptyProviderResult('us-direct', 'US_DIRECT_PRICE_PROVIDER=none · widget only', []);
}
