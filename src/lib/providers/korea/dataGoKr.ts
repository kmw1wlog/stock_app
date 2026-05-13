import 'server-only';
import { emptyProviderResult, type NormalizedQuote, type ProviderResult } from '@/lib/providers/types';
import { safeFetchJson } from '@/lib/providers/http';

const endpoint = 'https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo';

type DataGoKrResponse = {
  response?: {
    body?: {
      items?: {
        item?: Array<Record<string, string>>;
      };
    };
  };
};

function numberFrom(value: string | undefined) {
  const normalized = Number(String(value ?? '').replaceAll(',', ''));
  return Number.isFinite(normalized) ? normalized : undefined;
}

export async function fetchKoreaEodQuote(symbol: string): Promise<ProviderResult<NormalizedQuote | null>> {
  const key = process.env.DATA_GO_KR_SERVICE_KEY;
  if (!key) {
    return emptyProviderResult('data.go.kr', '전일 기준 · 공공데이터 키 없음 · mock fallback', null);
  }
  const url = new URL(endpoint);
  url.searchParams.set('serviceKey', key);
  url.searchParams.set('resultType', 'json');
  url.searchParams.set('numOfRows', '1');
  url.searchParams.set('likeSrtnCd', symbol);
  const raw = await safeFetchJson<DataGoKrResponse>(url.toString());
  const item = raw?.response?.body?.items?.item?.[0];
  if (!item) {
    return emptyProviderResult('data.go.kr', '전일 기준 · 공공데이터 empty', null);
  }
  const price = numberFrom(item.clpr ?? item.closePrice);
  const changePct = numberFrom(item.fltRt ?? item.changeRate);
  return {
    source: 'data.go.kr',
    basis: '전일 기준 · 공공데이터',
    fetchedAt: new Date().toISOString(),
    raw,
    data: {
      symbol,
      market: 'KR',
      price,
      changePct,
      volume: numberFrom(item.trqu),
      amount: numberFrom(item.trPrc),
      basis: '전일 기준 · 공공데이터',
      source: 'data.go.kr',
    },
  };
}
