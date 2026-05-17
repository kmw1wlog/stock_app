export type DataMode = 'live' | 'mock';

const liveDataSignals = [
  'DATABASE_URL',
  'DATA_GO_KR_SERVICE_KEY',
  'OPENDART_API_KEY',
  'NAVER_CLIENT_ID',
  'NAVER_CLIENT_SECRET',
  'MARKETAUX_API_TOKEN',
  'SEC_USER_AGENT',
  'KRX_OPENAPI_AUTH_KEY',
  'US_DIRECT_PRICE_PROVIDER',
  'ALPACA_API_KEY_ID',
  'ALPACA_API_SECRET_KEY',
  'FMP_API_KEY',
  'ALPHA_VANTAGE_API_KEY',
  'TWELVE_DATA_API_KEY',
  'KIWOOM_APP_KEY',
  'KIWOOM_SECRET_KEY',
  'KIWOOM_REST_API_KEY',
  'KIWOOM_REST_API_SECRET',
  'KIS_APP_KEY',
  'KIS_APP_SECRET',
];

function hasLiveDataBacking() {
  return liveDataSignals.some((key) => Boolean(process.env[key]));
}

export function getDataMode(): DataMode {
  if (process.env.DATA_MODE === 'live') return 'live';
  if (process.env.DATA_MODE === 'mock') return 'mock';
  if (process.env.NEXT_PUBLIC_ALLOW_MOCK_DATA === 'true') return 'mock';
  if (process.env.VERCEL === '1' && !hasLiveDataBacking()) return 'mock';
  return 'live';
}

export function isMockAllowed() {
  return getDataMode() === 'mock';
}

export function getMissingEnv(keys: string[]) {
  return keys.filter((key) => !process.env[key]);
}

export function emptyDataMessage(missing: string[] = []) {
  return missing.length ? 'API 키 필요' : '데이터 준비중';
}
