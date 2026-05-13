import 'server-only';
import { emptyProviderResult } from '@/lib/providers/types';
import { safeFetchJson } from '@/lib/providers/http';

export async function fetchAlternativeFearGreed() {
  const raw = await safeFetchJson<{ data?: Array<{ value?: string; value_classification?: string }> }>('https://api.alternative.me/fng/?limit=1');
  return emptyProviderResult('alternative-fng', '공포탐욕 공개 API 기준', raw?.data?.[0] ?? null);
}
