import 'server-only';
import { safeFetchJson } from '@/lib/providers/http';
import { emptyProviderResult } from '@/lib/providers/types';

export type MarketauxArticle = {
  title?: string;
  url?: string;
  source?: string;
  published_at?: string;
  symbols?: string[];
};

export async function fetchMarketauxNews(symbol: string) {
  const token = process.env.MARKETAUX_API_TOKEN;
  if (!token) return emptyProviderResult<MarketauxArticle[]>('marketaux', 'Marketaux API 키 필요', []);

  const url = new URL('https://api.marketaux.com/v1/news/all');
  url.searchParams.set('api_token', token);
  url.searchParams.set('symbols', symbol);
  url.searchParams.set('language', 'en');
  url.searchParams.set('limit', '5');
  url.searchParams.set('filter_entities', 'true');

  const raw = await safeFetchJson<{ data?: MarketauxArticle[] }>(url.toString());
  return emptyProviderResult('marketaux', 'Marketaux news title/link API', raw?.data ?? []);
}
