import 'server-only';
import { safeFetchJson } from '@/lib/providers/http';
import { emptyProviderResult } from '@/lib/providers/types';

export async function fetchSecCompanySubmissions(cik: string) {
  const userAgent = process.env.SEC_USER_AGENT;
  if (!userAgent || !cik) {
    return emptyProviderResult('sec-edgar', 'SEC_USER_AGENT 필요', null);
  }
  const padded = cik.padStart(10, '0');
  const raw = await safeFetchJson(`https://data.sec.gov/submissions/CIK${padded}.json`, {
    headers: { 'User-Agent': userAgent },
  });
  return emptyProviderResult('sec-edgar', 'SEC EDGAR filings metadata', raw);
}
