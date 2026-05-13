import { NextResponse } from 'next/server';
import { assertCronAuth } from '@/lib/cron/cronRoute';

const jobs = ['korea-eod', 'dart', 'naver-news', 'us-sec', 'crypto-quotes', 'fear-greed', 'generate-cards'];

export async function POST(request: Request) {
  if (!assertCronAuth(request)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const base = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const authorization = request.headers.get('authorization') ?? undefined;
  const results = [];
  for (const job of jobs) {
    try {
      const response = await fetch(`${base}/api/cron/${job}`, { headers: authorization ? { authorization } : undefined, cache: 'no-store' });
      results.push({ job, ok: response.ok, status: response.status, body: await response.json().catch(() => ({})) });
    } catch (error) {
      results.push({ job, ok: false, error: error instanceof Error ? error.message : 'unknown error' });
    }
  }
  return NextResponse.json({ ok: results.every((result) => result.ok), jobs: results });
}
