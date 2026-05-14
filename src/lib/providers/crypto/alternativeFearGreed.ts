import 'server-only';
import { safeProviderFetch } from '@/lib/providers/http';
import { emptyProviderResult } from '@/lib/providers/types';

export async function fetchAlternativeFearGreed() {
  const basis = '공포탐욕 공개 API 기준';
  const outcome = await safeProviderFetch<{ data?: Array<{ value?: string; value_classification?: string }> }>({
    provider: 'alternative-fng',
    url: 'https://api.alternative.me/fng/?limit=1',
    basis,
  });
  return { ...emptyProviderResult('alternative-fng', basis, outcome.data?.data?.[0] ?? null), raw: outcome };
}
