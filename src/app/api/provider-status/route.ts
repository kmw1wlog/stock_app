import { NextResponse } from 'next/server';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { envelope } from '@/lib/marketData';

function envStatus(required: string[]) {
  const missing = required.filter((key) => !process.env[key]);
  return missing.length ? { status: 'key_missing', missing } : { status: 'configured', missing: [] };
}

export async function GET() {
  const runs = hasDatabaseUrl() ? await prisma.cronRun.findMany({ orderBy: { startedAt: 'desc' }, take: 40 }) : [];
  const lastRun = (jobName: string) => runs.find((run) => run.jobName === jobName);
  const providers = [
    { provider: 'Data.go.kr', data: 'KR EOD price', envRequired: 'DATA_GO_KR_SERVICE_KEY', uiSection: 'Home/Explore/Chart', jobName: 'korea-eod', ...envStatus(['DATA_GO_KR_SERVICE_KEY']) },
    { provider: 'OpenDART', data: 'Disclosure metadata', envRequired: 'OPENDART_API_KEY', uiSection: 'Detail/Report', jobName: 'dart', ...envStatus(['OPENDART_API_KEY']) },
    { provider: 'Naver News', data: 'News title/link', envRequired: 'NAVER_CLIENT_ID,NAVER_CLIENT_SECRET', uiSection: 'Explore/Report', jobName: 'naver-news', ...envStatus(['NAVER_CLIENT_ID', 'NAVER_CLIENT_SECRET']) },
    { provider: 'KRX Open API', data: 'Short selling/investor flow', envRequired: 'KRX_OPENAPI_AUTH_KEY,KRX_*_API_ID', uiSection: 'Explore flows', jobName: 'krx', ...envStatus(['KRX_OPENAPI_AUTH_KEY', 'KRX_SHORT_SELLING_API_ID', 'KRX_INVESTOR_FLOW_API_ID']) },
    { provider: 'SEC EDGAR', data: 'US filings metadata', envRequired: 'SEC_USER_AGENT', uiSection: 'US detail/report', jobName: 'us-sec', ...envStatus(['SEC_USER_AGENT']) },
    { provider: 'Binance', data: 'Crypto 24h ticker/candles', envRequired: 'none', uiSection: 'Home/Explore/Crypto', jobName: 'crypto-quotes', status: 'public_api', missing: [] },
    { provider: 'Upbit', data: 'KRW crypto ticker/candles', envRequired: 'none', uiSection: 'Home/Explore/Crypto', jobName: 'crypto-quotes', status: 'public_api', missing: [] },
    { provider: 'Alternative Fear & Greed', data: 'Crypto sentiment', envRequired: 'none', uiSection: 'Report/maps', jobName: 'fear-greed', status: 'public_api', missing: [] },
  ].map((provider) => {
    const run = lastRun(provider.jobName);
    return { ...provider, lastTest: run?.finishedAt?.toISOString() ?? run?.startedAt?.toISOString() ?? null, lastRunStatus: run?.status ?? null, notes: run?.message ?? null };
  });

  return NextResponse.json(envelope(providers, 'provider-status', '환경변수 및 최근 CronRun 기준'));
}
