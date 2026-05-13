import { NextResponse } from 'next/server';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { envelope } from '@/lib/marketData';

function envStatus(required: string[]) {
  const missing = required.filter((key) => !process.env[key]);
  return missing.length ? { status: 'key_missing', missing } : { status: 'configured', missing: [] };
}

export async function GET() {
  const runs = hasDatabaseUrl() ? await prisma.cronRun.findMany({ orderBy: { startedAt: 'desc' }, take: 60 }) : [];
  const lastRun = (jobName: string) => runs.find((run) => run.jobName === jobName);
  const providers = [
    { provider: 'Data.go.kr', data: 'KR EOD price', envRequired: 'DATA_GO_KR_SERVICE_KEY', uiSection: 'Home/Explore/Chart', jobName: 'korea-eod', mode: 'api', ...envStatus(['DATA_GO_KR_SERVICE_KEY']) },
    { provider: 'OpenDART', data: 'Disclosure metadata', envRequired: 'OPENDART_API_KEY', uiSection: 'Detail/Report', jobName: 'dart', mode: 'api', ...envStatus(['OPENDART_API_KEY']) },
    { provider: 'Naver News', data: 'KR news title/link', envRequired: 'NAVER_CLIENT_ID,NAVER_CLIENT_SECRET', uiSection: 'Explore/Report', jobName: 'naver-news', mode: 'api', ...envStatus(['NAVER_CLIENT_ID', 'NAVER_CLIENT_SECRET']) },
    { provider: 'Marketaux', data: 'US/global news title/link', envRequired: 'MARKETAUX_API_TOKEN', uiSection: 'Explore/Report', jobName: 'marketaux-news', mode: 'api', ...envStatus(['MARKETAUX_API_TOKEN']) },
    { provider: 'SEC EDGAR', data: 'US filings metadata', envRequired: 'SEC_USER_AGENT', uiSection: 'US detail/report', jobName: 'us-sec', mode: 'api/site', ...envStatus(['SEC_USER_AGENT']) },
    { provider: 'Alpaca', data: 'US direct quote/candles', envRequired: 'US_DIRECT_PRICE_PROVIDER=alpaca,ALPACA_API_KEY_ID,ALPACA_API_SECRET_KEY', uiSection: 'US cards/labels', jobName: 'us-direct-quotes', mode: 'api', ...envStatus(['ALPACA_API_KEY_ID', 'ALPACA_API_SECRET_KEY']) },
    { provider: 'FMP', data: 'US direct quote', envRequired: 'US_DIRECT_PRICE_PROVIDER=fmp,FMP_API_KEY', uiSection: 'US cards/labels', jobName: 'us-direct-quotes', mode: 'api', ...envStatus(['FMP_API_KEY']) },
    { provider: 'Alpha Vantage', data: 'US global quote', envRequired: 'US_DIRECT_PRICE_PROVIDER=alphaVantage,ALPHA_VANTAGE_API_KEY', uiSection: 'US cards/labels', jobName: 'us-direct-quotes', mode: 'api', ...envStatus(['ALPHA_VANTAGE_API_KEY']) },
    { provider: 'Twelve Data', data: 'US quote/candles', envRequired: 'US_DIRECT_PRICE_PROVIDER=twelveData,TWELVE_DATA_API_KEY', uiSection: 'US cards/labels', jobName: 'us-direct-quotes', mode: 'api', ...envStatus(['TWELVE_DATA_API_KEY']) },
    { provider: 'TradingView widgets', data: 'US price/chart display', envRequired: 'NEXT_PUBLIC_ENABLE_TRADINGVIEW_WIDGETS=true', uiSection: 'Home/Detail', jobName: 'widget', mode: 'official_widget', status: process.env.NEXT_PUBLIC_ENABLE_TRADINGVIEW_WIDGETS === 'true' ? 'configured' : 'disabled', missing: [] },
    { provider: 'CoinGecko widgets', data: 'Crypto price/chart display', envRequired: 'NEXT_PUBLIC_ENABLE_COINGECKO_WIDGETS=true', uiSection: 'Crypto Detail', jobName: 'widget', mode: 'official_widget', status: process.env.NEXT_PUBLIC_ENABLE_COINGECKO_WIDGETS === 'true' ? 'configured' : 'disabled', missing: [] },
    { provider: 'KRX Open API', data: 'Short selling/investor flow', envRequired: 'KRX_OPENAPI_AUTH_KEY,KRX_*_API_ID', uiSection: 'Explore flows', jobName: 'krx', mode: 'api', ...envStatus(['KRX_OPENAPI_AUTH_KEY', 'KRX_SHORT_SELLING_API_ID', 'KRX_INVESTOR_FLOW_API_ID']) },
    { provider: 'Binance', data: 'Crypto 24h ticker/candles', envRequired: 'none', uiSection: 'Home/Explore/Crypto', jobName: 'crypto-quotes', mode: 'public_api', status: 'public_api', missing: [] },
    { provider: 'Upbit', data: 'KRW crypto ticker/candles', envRequired: 'none', uiSection: 'Home/Explore/Crypto', jobName: 'crypto-quotes', mode: 'public_api', status: 'public_api', missing: [] },
    { provider: 'Alternative Fear & Greed', data: 'Crypto sentiment', envRequired: 'none', uiSection: 'Report/maps', jobName: 'fear-greed', mode: 'public_api', status: 'public_api', missing: [] },
    { provider: 'Coinalyze', data: 'Crypto funding/OI', envRequired: 'COINALYZE_API_KEY', uiSection: 'Future crypto labels', jobName: 'none', mode: 'api', ...envStatus(['COINALYZE_API_KEY']) },
    { provider: 'FRED', data: 'Macro data', envRequired: 'FRED_API_KEY', uiSection: 'Future macro labels', jobName: 'none', mode: 'api', ...envStatus(['FRED_API_KEY']) },
    { provider: 'BLS', data: 'Macro labor data', envRequired: 'BLS_API_KEY', uiSection: 'Future macro labels', jobName: 'none', mode: 'api', ...envStatus(['BLS_API_KEY']) },
  ].map((provider) => {
    const run = provider.jobName === 'none' || provider.jobName === 'widget' ? undefined : lastRun(provider.jobName);
    return { ...provider, lastTest: run?.finishedAt?.toISOString() ?? run?.startedAt?.toISOString() ?? null, lastRunStatus: run?.status ?? null, notes: run?.message ?? null };
  });

  return NextResponse.json(envelope(providers, 'provider-status', '환경변수, 공식 API, 공식 위젯, 최근 CronRun 기준'));
}
