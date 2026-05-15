import 'server-only';
import { emptyProviderResult } from '@/lib/providers/types';
import { safeFetchJson } from '@/lib/providers/http';

export async function fetchOpenDartRecentFilings(corpCode: string) {
  const key = process.env.OPENDART_API_KEY;
  if (!key || !corpCode) {
    return emptyProviderResult('opendart', '공시 API 키 또는 corpCode 없음 · empty fallback', []);
  }
  const url = new URL('https://opendart.fss.or.kr/api/list.json');
  url.searchParams.set('crtfc_key', key);
  url.searchParams.set('corp_code', corpCode);
  url.searchParams.set('bgn_de', `${new Date().getFullYear()}0101`);
  url.searchParams.set('page_count', '10');
  const raw = await safeFetchJson<{ status?: string; message?: string; list?: unknown[] }>(url.toString());
  return emptyProviderResult('opendart', '최근 공시 metadata 기준', raw?.list ?? []);
}
