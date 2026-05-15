import { NextResponse } from 'next/server';
import { assertCronAuth } from '@/lib/cron/cronRoute';
import {
  cryptoQuotesJob,
  dartJob,
  defaultAssetsJob,
  fearGreedJob,
  generateCardsJob,
  koreaEodJob,
  marketauxNewsJob,
  naverNewsJob,
  runJobDirect,
  usDirectQuotesJob,
  usSecJob,
} from '@/lib/jobs';
import { APP_VERSION } from '@/lib/version';

const jobs = [
  ['default-assets', defaultAssetsJob],
  ['crypto-quotes', cryptoQuotesJob],
  ['fear-greed', fearGreedJob],
  ['korea-eod', koreaEodJob],
  ['dart', dartJob],
  ['naver-news', naverNewsJob],
  ['us-sec', usSecJob],
  ['us-direct-quotes', usDirectQuotesJob],
  ['marketaux-news', marketauxNewsJob],
  ['generate-cards', generateCardsJob],
] as const;

export async function POST(request: Request) {
  if (!assertCronAuth(request)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const results = [];
  for (const [jobName, handler] of jobs) {
    results.push(await runJobDirect(jobName, handler));
  }

  const summary = results.reduce(
    (acc, result) => {
      if (result.ok) acc.success += 1;
      else if (result.missingEnv.length) acc.missing_env += 1;
      else acc.failed += 1;
      return acc;
    },
    { success: 0, missing_env: 0, failed: 0 },
  );

  return NextResponse.json({
    ok: results.some((result) => result.saved > 0 || result.fetched > 0),
    version: APP_VERSION,
    summary,
    jobs: results,
    sampleCards: results.find((result) => result.jobName === 'generate-cards')?.metadata ?? null,
  });
}
