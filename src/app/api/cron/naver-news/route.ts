import { runCronJob } from '@/lib/cron/cronRoute';
import { fetchNaverNewsMentions } from '@/lib/providers/korea/naverNews';

export async function GET(request: Request) {
  return runCronJob(request, 'naver-news', async () => {
    const result = await fetchNaverNewsMentions('로봇 테마');
    return { source: result.source, count: result.data.length };
  });
}
