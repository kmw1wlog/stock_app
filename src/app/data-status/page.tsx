import { AlertCircle, CheckCircle2, Database } from 'lucide-react';
import { MobileShell } from '@/components/layout/MobileShell';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { getDataMode } from '@/lib/dataMode';
import { APP_RELEASE_NAME, APP_VERSION } from '@/lib/version';

function envStatus(required: string[]) {
  const missing = required.filter((key) => !process.env[key]);
  return missing.length ? { status: '키 없음', missing } : { status: '설정됨', missing: [] };
}

async function providerRows() {
  const runs = hasDatabaseUrl() ? await prisma.cronRun.findMany({ orderBy: { startedAt: 'desc' }, take: 40 }) : [];
  const lastRun = (jobName: string) => runs.find((run) => run.jobName === jobName);
  return [
    { provider: 'Data.go.kr', data: '국장 EOD 가격', jobName: 'korea-eod', ...envStatus(['DATA_GO_KR_SERVICE_KEY']) },
    { provider: 'OpenDART', data: '국장 공시', jobName: 'dart', ...envStatus(['OPENDART_API_KEY']) },
    { provider: 'Naver News', data: '뉴스 제목/링크', jobName: 'naver-news', ...envStatus(['NAVER_CLIENT_ID', 'NAVER_CLIENT_SECRET']) },
    { provider: 'SEC EDGAR', data: '미장 공시', jobName: 'us-sec', ...envStatus(['SEC_USER_AGENT']) },
    { provider: 'Binance', data: '코인 24h/캔들', jobName: 'crypto-quotes', status: '공개 API', missing: [] },
    { provider: 'Upbit', data: 'KRW 코인 24h/캔들', jobName: 'crypto-quotes', status: '공개 API', missing: [] },
    { provider: 'KRX Open API', data: '공매도/수급', jobName: 'krx', ...envStatus(['KRX_OPENAPI_AUTH_KEY', 'KRX_SHORT_SELLING_API_ID', 'KRX_INVESTOR_FLOW_API_ID']) },
    { provider: 'Alternative Fear & Greed', data: '코인 심리', jobName: 'fear-greed', status: '공개 API', missing: [] },
  ].map((row) => {
    const run = lastRun(row.jobName);
    return { ...row, lastTest: run?.finishedAt?.toISOString() ?? run?.startedAt?.toISOString() ?? '없음', lastRunStatus: run?.status ?? '없음' };
  });
}

export default async function DataStatusPage() {
  const rows = await providerRows();
  return (
    <MobileShell>
      <div className="space-y-5 px-5 py-6">
        <header>
          <p className="text-xs font-black text-[#0B63F6]">{APP_VERSION} · {APP_RELEASE_NAME}</p>
          <h1 className="mt-2 text-3xl font-black">데이터 제공 상태</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">현재 모드: {getDataMode()}. 키가 없거나 실패한 provider는 임의 데이터로 대체하지 않습니다.</p>
        </header>
        <div className="space-y-3">
          {rows.map((row) => {
            const ok = row.status === '설정됨' || row.status === '공개 API';
            return (
              <section key={row.provider} className="rounded-3xl border border-slate-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className={ok ? 'mt-1 text-emerald-500' : 'mt-1 text-orange-500'}>{ok ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}</span>
                  <div className="min-w-0">
                    <h2 className="text-base font-black">{row.provider}</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-600">{row.data}</p>
                    <p className="mt-2 text-xs font-bold text-slate-500">상태: {row.status} · 최근 실행: {row.lastTest}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">최근 결과: {row.lastRunStatus}</p>
                    {row.missing.length ? <p className="mt-1 text-xs font-bold text-orange-600">필요 env: {row.missing.join(', ')}</p> : null}
                  </div>
                </div>
              </section>
            );
          })}
          {!rows.length ? <div className="rounded-3xl border border-slate-200 bg-white p-5 text-center"><Database className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 text-sm font-bold text-slate-500">데이터 상태를 불러오지 못했습니다.</p></div> : null}
        </div>
      </div>
    </MobileShell>
  );
}
