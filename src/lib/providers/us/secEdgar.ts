import 'server-only';
import { emptyProviderResult } from '@/lib/providers/types';
import { safeFetchJson } from '@/lib/providers/http';

export async function fetchSecCompanySubmissions(cik: string) {
  const userAgent = process.env.SEC_USER_AGENT;
  if (!userAgent || !cik) {
    return emptyProviderResult('sec-edgar', 'SEC user agent 없음 · empty fallback', null);
  }
  const padded = cik.padStart(10, '0');
  const raw = await safeFetchJson(`https://data.sec.gov/submissions/CIK${padded}.json`, {
    headers: { 'User-Agent': userAgent },
  });
  return emptyProviderResult('sec-edgar', 'SEC EDGAR filings metadata', raw);
}
