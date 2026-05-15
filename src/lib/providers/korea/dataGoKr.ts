import 'server-only';
import { emptyProviderResult, type NormalizedCandle, type NormalizedQuote, type ProviderResult } from '@/lib/providers/types';
import { safeFetchJson } from '@/lib/providers/http';

const endpoint = 'https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo';

type DataGoKrResponse = {
  response?: {
    header?: { resultCode?: string; resultMsg?: string };
    body?: {
      items?: {
        item?: Array<Record<string, string>> | Record<string, string>;
      };
    };
  };
};

function itemsFrom(raw: DataGoKrResponse | null | undefined) {
  const item = raw?.response?.body?.items?.item;
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

function numberFrom(value: string | undefined) {
  const normalized = Number(String(value ?? '').replaceAll(',', ''));
  return Number.isFinite(normalized) ? normalized : undefined;
}

function dateFrom(item: Record<string, string>) {
  const value = item.basDt;
  if (!value || value.length !== 8) return new Date().toISOString().slice(0, 10);
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function buildUrl(symbol: string, rows: number) {
  const key = process.env.DATA_GO_KR_SERVICE_KEY;
  if (!key) return null;
  const url = new URL(endpoint);
  url.searchParams.set('serviceKey', key);
  url.searchParams.set('resultType', 'json');
  url.searchParams.set('numOfRows', String(rows));
  url.searchParams.set('likeSrtnCd', symbol);
  return url;
}

export async function fetchKoreaEodQuote(symbol: string): Promise<ProviderResult<NormalizedQuote | null>> {
  const url = buildUrl(symbol, 1);
  if (!url) {
    return emptyProviderResult('data.go.kr', '전일 기준 · 공공데이터 · API 키 필요', null);
  }
  const raw = await safeFetchJson<DataGoKrResponse>(url.toString());
  const item = itemsFrom(raw)[0];
  if (!item) {
    return emptyProviderResult('data.go.kr', '전일 기준 · 공공데이터 · 데이터 없음', null);
  }
  return {
    source: 'data.go.kr',
    basis: '전일 기준 · 공공데이터',
    fetchedAt: new Date().toISOString(),
    raw,
    data: {
      symbol,
      market: 'KR',
      price: numberFrom(item.clpr ?? item.closePrice),
      changePct: numberFrom(item.fltRt ?? item.changeRate),
      volume: numberFrom(item.trqu),
      amount: numberFrom(item.trPrc),
      basis: '전일 기준 · 공공데이터',
      source: 'data.go.kr',
    },
  };
}

export async function fetchKoreaEodQuotes(symbols: string[]) {
  const results: Array<ProviderResult<NormalizedQuote | null>> = [];
  for (const symbol of symbols) {
    results.push(await fetchKoreaEodQuote(symbol));
  }
  return results;
}

export async function fetchKoreaDailyCandles(symbol: string, limit = 120): Promise<ProviderResult<NormalizedCandle[]>> {
  const url = buildUrl(symbol, limit);
  if (!url) {
    return emptyProviderResult('data.go.kr', '일봉 기준 · 공공데이터 · API 키 필요', []);
  }
  const raw = await safeFetchJson<DataGoKrResponse>(url.toString());
  const candles = itemsFrom(raw)
    .map((item) => ({
      symbol,
      market: 'KR' as const,
      time: dateFrom(item),
      open: numberFrom(item.mkp),
      high: numberFrom(item.hipr),
      low: numberFrom(item.lopr),
      close: numberFrom(item.clpr),
      volume: numberFrom(item.trqu),
      amount: numberFrom(item.trPrc),
      source: 'data.go.kr',
    }))
    .filter((item) => item.close)
    .sort((a, b) => a.time.localeCompare(b.time));
  return { source: 'data.go.kr', basis: '일봉 기준 · 공공데이터', fetchedAt: new Date().toISOString(), raw, data: candles };
}
