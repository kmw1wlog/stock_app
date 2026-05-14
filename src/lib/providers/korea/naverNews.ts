import 'server-only';
import { emptyProviderResult } from '@/lib/providers/types';
import { safeFetchJson } from '@/lib/providers/http';

export type NaverNewsItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  originallink?: string;
  description?: string;
};

export async function fetchNaverNewsMentions(query: string) {
  const id = process.env.NAVER_CLIENT_ID;
  const secret = process.env.NAVER_CLIENT_SECRET;
  if (!id || !secret) {
    return emptyProviderResult<NaverNewsItem[]>('naver-news', '뉴스 API 키 없음 · empty fallback', []);
  }
  const url = new URL('https://openapi.naver.com/v1/search/news.json');
  url.searchParams.set('query', query);
  url.searchParams.set('display', '5');
  url.searchParams.set('sort', 'date');
  const raw = await safeFetchJson<{ items?: NaverNewsItem[] }>(url.toString(), {
    headers: {
      'X-Naver-Client-Id': id,
      'X-Naver-Client-Secret': secret,
    },
  });
  return emptyProviderResult('naver-news', '뉴스 제목/링크 기준 · 본문 재게시 없음', raw?.items ?? []);
}
