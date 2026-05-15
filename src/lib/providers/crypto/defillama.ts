import 'server-only';
import { emptyProviderResult } from '@/lib/providers/types';
import { safeFetchJson } from '@/lib/providers/http';

export async function fetchDefiLlamaProtocol(slug: string) {
  const raw = await safeFetchJson(`https://api.llama.fi/protocol/${slug}`);
  return emptyProviderResult('defillama', 'TVL/fees 공개 API 기준', raw);
}
