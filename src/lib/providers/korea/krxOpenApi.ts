import 'server-only';
import { emptyProviderResult, type ProviderResult } from '@/lib/providers/types';
import { safeFetchJson } from '@/lib/providers/http';

type KrxPayload = Record<string, unknown>;

async function fetchKrxOpenApi(apiId: string | undefined, params: Record<string, string>): Promise<ProviderResult<KrxPayload | null>> {
  const authKey = process.env.KRX_OPENAPI_AUTH_KEY;
  if (!authKey || !apiId) {
    return emptyProviderResult('KRX Open API', 'KRX 조회 불가 · 라벨 비활성', null);
  }

  const url = new URL(`https://data-dbg.krx.co.kr/svc/apis/${apiId}`);
  url.searchParams.set('AUTH_KEY', authKey);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const data = await safeFetchJson<KrxPayload>(url.toString(), {
    headers: { Accept: 'application/json' },
  });

  return {
    source: 'KRX Open API',
    basis: 'KRX Open API 기준',
    fetchedAt: new Date().toISOString(),
    data: data ?? null,
    raw: data,
  };
}

export function fetchKrxShortSelling(symbol: string, date: string) {
  return fetchKrxOpenApi(process.env.KRX_SHORT_SELLING_API_ID, { isuCd: symbol, basDd: date });
}

export function fetchKrxInvestorFlow(symbol: string, date: string) {
  return fetchKrxOpenApi(process.env.KRX_INVESTOR_FLOW_API_ID, { isuCd: symbol, basDd: date });
}
