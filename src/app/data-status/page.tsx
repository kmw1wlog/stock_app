import { AlertCircle, CheckCircle2, Database } from 'lucide-react';
import { MobileShell } from '@/components/layout/MobileShell';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { getDataMode } from '@/lib/dataMode';
import { APP_RELEASE_NAME, APP_VERSION } from '@/lib/version';

const providerDefinitions = [
  { provider: 'data.go.kr', label: 'Data.go.kr', dataType: 'kr_eod', data: '국장 EOD 가격', envRequired: ['DATA_GO_KR_SERVICE_KEY'], uiSection: '홈/탐색/차트', jobName: 'korea-eod' },
  { provider: 'opendart', label: 'OpenDART', dataType: 'kr_disclosure', data: '국장 공시', envRequired: ['OPENDART_API_KEY'], uiSection: '상세/리포트', jobName: 'dart' },
  { provider: 'naver-news', label: 'Naver News', dataType: 'news', data: '뉴스 제목/링크', envRequired: ['NAVER_CLIENT_ID', 'NAVER_CLIENT_SECRET'], uiSection: '탐색/리포트', jobName: 'naver-news' },
  { provider: 'marketaux', label: 'Marketaux', dataType: 'news', data: '미장/글로벌 뉴스 제목/링크', envRequired: ['MARKETAUX_API_TOKEN'], uiSection: '탐색/리포트', jobName: 'marketaux-news' },
  { provider: 'sec-edgar', label: 'SEC EDGAR', dataType: 'us_filings', data: '미장 공시', envRequired: ['SEC_USER_AGENT'], uiSection: '미장 상세/리포트', jobName: 'us-sec' },
  { provider: 'tradingview-widget', label: 'TradingView widgets', dataType: 'widget', data: '미장 가격/차트 위젯', envRequired: [], uiSection: '홈/상세', jobName: 'widget' },
  { provider: 'binance', label: 'Binance', dataType: 'crypto_24h_ticker', data: '코인 24h/캔들', envRequired: [], uiSection: '홈/탐색/차트', jobName: 'crypto-quotes' },
  { provider: 'upbit', label: 'Upbit', dataType: 'crypto_24h_ticker', data: 'KRW 코인 24h/캔들', envRequired: [], uiSection: '홈/탐색/차트', jobName: 'crypto-quotes' },
  { provider: 'alternative-fng', label: 'Alternative Fear & Greed', dataType: 'crypto_sentiment', data: '코인 심리', envRequired: [], uiSection: '리포트/맵', jobName: 'fear-greed' },
  { provider: 'krx', label: 'KRX Open API', dataType: 'short_flow', data: '공매도/수급', envRequired: ['KRX_OPENAPI_AUTH_KEY', 'KRX_SHORT_SELLING_API_ID', 'KRX_INVESTOR_FLOW_API_ID'], uiSection: '수급 탐색', jobName: 'krx' },
] as const;

function envStatus(required: readonly string[]) {
  const missing = required.filter((key) => !process.env[key]);
  return missing.length ? { status: 'missing_env', missing } : { status: 'configured', missing: [] as string[] };
}

async function providerRows() {
  const runs = hasDatabaseUrl() ? await prisma.cronRun.findMany({ orderBy: { startedAt: 'desc' }, take: 80 }) : [];
  const statuses = hasDatabaseUrl() ? await prisma.dataProviderStatus.findMany({ orderBy: { lastCheckedAt: 'desc' } }) : [];
  const lastRun = (jobName: string) => runs.find((run) => run.jobName === jobName);
  const statusFor = (provider: string, dataType: string) => statuses.find((status) => status.provider === provider && status.dataType === dataType);

  return providerDefinitions.map((definition) => {
    const run = definition.jobName === 'widget' ? undefined : lastRun(definition.jobName);
    const persisted = statusFor(definition.provider, definition.dataType);
    const env = envStatus(definition.envRequired);
    const widgetStatus =
      definition.provider === 'tradingview-widget'
        ? process.env.NEXT_PUBLIC_ENABLE_TRADINGVIEW_WIDGETS === 'true' ? 'configured' : 'disabled'
        : undefined;
    return {
      ...definition,
      status: persisted?.status ?? widgetStatus ?? env.status,
      missing: Array.isArray(persisted?.envMissing) ? persisted.envMissing.map(String) : env.missing,
      itemCount: persisted?.itemCount ?? 0,
      failedCount: (run?.metadata as { failed?: number } | null)?.failed ?? 0,
      lastCheckedAt: persisted?.lastCheckedAt?.toISOString() ?? null,
      lastSuccessAt: persisted?.lastSuccessAt?.toISOString() ?? null,
      lastRun: run?.finishedAt?.toISOString() ?? run?.startedAt?.toISOString() ?? null,
      lastRunStatus: run?.status ?? null,
      lastError: persisted?.lastError ?? run?.message ?? null,
      notes: persisted?.notes ?? null,
    };
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
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">현재 모드: {getDataMode()}. 키가 없거나 실패한 provider는 가짜 데이터로 대체하지 않습니다.</p>
        </header>
        <div className="space-y-3">
          {rows.map((row) => {
            const ok = row.status === 'success' || row.status === 'configured';
            return (
              <section key={`${row.provider}-${row.dataType}`} className="rounded-3xl border border-slate-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <span className={ok ? 'mt-1 text-emerald-500' : 'mt-1 text-orange-500'}>{ok ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}</span>
                  <div className="min-w-0 space-y-1">
                    <h2 className="text-base font-black">{row.label}</h2>
                    <p className="text-sm font-semibold text-slate-600">{row.data} · UI: {row.uiSection}</p>
                    <p className="text-xs font-bold text-slate-500">상태: {row.status} · 마지막 실행: {row.lastRun ?? '없음'}</p>
                    <p className="text-xs font-bold text-slate-500">저장 수: {row.itemCount} · 실패 수: {row.failedCount} · 실행 결과: {row.lastRunStatus ?? '없음'}</p>
                    {row.lastSuccessAt ? <p className="text-xs font-bold text-emerald-600">마지막 성공: {row.lastSuccessAt}</p> : null}
                    {row.missing.length ? <p className="text-xs font-bold text-orange-600">필요 env: {row.missing.join(', ')}</p> : null}
                    {row.lastError ? <p className="text-xs font-bold text-rose-600">마지막 오류: {row.lastError}</p> : null}
                    {row.notes ? <p className="text-xs font-semibold text-slate-500">메모: {row.notes}</p> : null}
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
