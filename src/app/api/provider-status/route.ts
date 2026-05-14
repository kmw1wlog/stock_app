import { NextResponse } from 'next/server';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { envelope } from '@/lib/marketData';

function envStatus(required: string[]) {
  const missing = required.filter((key) => !process.env[key]);
  return missing.length ? { status: 'key_missing', missing } : { status: 'configured', missing: [] };
}

const providerDefinitions = [
  { provider: 'data.go.kr', label: 'Data.go.kr', dataType: 'kr_eod', data: 'KR EOD price', envRequired: ['DATA_GO_KR_SERVICE_KEY'], uiSection: 'Home/Explore/Chart', jobName: 'korea-eod', mode: 'api' },
  { provider: 'opendart', label: 'OpenDART', dataType: 'kr_disclosure', data: 'Disclosure metadata', envRequired: ['OPENDART_API_KEY'], uiSection: 'Detail/Report', jobName: 'dart', mode: 'api' },
  { provider: 'naver-news', label: 'Naver News', dataType: 'news', data: 'KR news title/link', envRequired: ['NAVER_CLIENT_ID', 'NAVER_CLIENT_SECRET'], uiSection: 'Explore/Report', jobName: 'naver-news', mode: 'api' },
  { provider: 'marketaux', label: 'Marketaux', dataType: 'news', data: 'US/global news title/link', envRequired: ['MARKETAUX_API_TOKEN'], uiSection: 'Explore/Report', jobName: 'marketaux-news', mode: 'api' },
  { provider: 'sec-edgar', label: 'SEC EDGAR', dataType: 'us_filings', data: 'US filings metadata', envRequired: ['SEC_USER_AGENT'], uiSection: 'US detail/report', jobName: 'us-sec', mode: 'api/site' },
  { provider: 'alpaca', label: 'Alpaca', dataType: 'us_quote', data: 'US direct quote/candles', envRequired: ['ALPACA_API_KEY_ID', 'ALPACA_API_SECRET_KEY'], uiSection: 'US cards/labels', jobName: 'us-direct-quotes', mode: 'api' },
  { provider: 'fmp', label: 'FMP', dataType: 'us_quote', data: 'US direct quote', envRequired: ['FMP_API_KEY'], uiSection: 'US cards/labels', jobName: 'us-direct-quotes', mode: 'api' },
  { provider: 'alphaVantage', label: 'Alpha Vantage', dataType: 'us_quote', data: 'US global quote', envRequired: ['ALPHA_VANTAGE_API_KEY'], uiSection: 'US cards/labels', jobName: 'us-direct-quotes', mode: 'api' },
  { provider: 'twelveData', label: 'Twelve Data', dataType: 'us_quote', data: 'US quote/candles', envRequired: ['TWELVE_DATA_API_KEY'], uiSection: 'US cards/labels', jobName: 'us-direct-quotes', mode: 'api' },
  { provider: 'tradingview-widget', label: 'TradingView widgets', dataType: 'widget', data: 'US price/chart display', envRequired: [], uiSection: 'Home/Detail', jobName: 'widget', mode: 'official_widget' },
  { provider: 'coingecko-widget', label: 'CoinGecko widgets', dataType: 'widget', data: 'Crypto price/chart display', envRequired: [], uiSection: 'Crypto Detail', jobName: 'widget', mode: 'official_widget' },
  { provider: 'krx', label: 'KRX Open API', dataType: 'short_flow', data: 'Short selling/investor flow', envRequired: ['KRX_OPENAPI_AUTH_KEY', 'KRX_SHORT_SELLING_API_ID', 'KRX_INVESTOR_FLOW_API_ID'], uiSection: 'Explore flows', jobName: 'krx', mode: 'api' },
  { provider: 'binance', label: 'Binance', dataType: 'crypto_24h_ticker', data: 'Crypto 24h ticker/candles', envRequired: [], uiSection: 'Home/Explore/Crypto', jobName: 'crypto-quotes', mode: 'public_api' },
  { provider: 'upbit', label: 'Upbit', dataType: 'crypto_24h_ticker', data: 'KRW crypto ticker/candles', envRequired: [], uiSection: 'Home/Explore/Crypto', jobName: 'crypto-quotes', mode: 'public_api' },
  { provider: 'alternative-fng', label: 'Alternative Fear & Greed', dataType: 'crypto_sentiment', data: 'Crypto sentiment', envRequired: [], uiSection: 'Report/maps', jobName: 'fear-greed', mode: 'public_api' },
] as const;

export async function GET() {
  const runs = hasDatabaseUrl() ? await prisma.cronRun.findMany({ orderBy: { startedAt: 'desc' }, take: 80 }) : [];
  const statuses = hasDatabaseUrl() ? await prisma.dataProviderStatus.findMany({ orderBy: { lastCheckedAt: 'desc' } }) : [];
  const lastRun = (jobName: string) => runs.find((run) => run.jobName === jobName);
  const statusFor = (provider: string, dataType: string) => statuses.find((status) => status.provider === provider && status.dataType === dataType);

  const providers = providerDefinitions.map((definition) => {
    const env = envStatus([...definition.envRequired]);
    const run = definition.jobName === 'widget' ? undefined : lastRun(definition.jobName);
    const persisted = statusFor(definition.provider, definition.dataType);
    const widgetStatus =
      definition.provider === 'tradingview-widget'
        ? process.env.NEXT_PUBLIC_ENABLE_TRADINGVIEW_WIDGETS === 'true' ? 'configured' : 'disabled'
        : definition.provider === 'coingecko-widget'
          ? process.env.NEXT_PUBLIC_ENABLE_COINGECKO_WIDGETS === 'true' ? 'configured' : 'disabled'
          : undefined;

    return {
      provider: definition.label,
      providerKey: definition.provider,
      dataType: definition.dataType,
      data: definition.data,
      envRequired: definition.envRequired.join(', ') || 'none',
      uiSection: definition.uiSection,
      mode: definition.mode,
      status: persisted?.status ?? widgetStatus ?? env.status,
      missing: persisted?.envMissing ?? env.missing,
      itemCount: persisted?.itemCount ?? 0,
      lastCheckedAt: persisted?.lastCheckedAt?.toISOString() ?? null,
      lastSuccessAt: persisted?.lastSuccessAt?.toISOString() ?? null,
      lastError: persisted?.lastError ?? null,
      notes: persisted?.notes ?? run?.message ?? null,
      lastRunStatus: run?.status ?? null,
      cronMetadata: run?.metadata ?? null,
    };
  });

  return NextResponse.json({
    ...envelope(providers, 'provider-status', '환경변수, provider runtime status, 최근 CronRun 기준'),
    providers,
  });
}
