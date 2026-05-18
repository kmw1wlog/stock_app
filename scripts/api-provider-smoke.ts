import { existsSync, readFileSync } from 'node:fs';

type SmokeResult = {
  provider: string;
  ok: boolean;
  status?: number;
  endpoint: string;
  summary?: string;
  error?: string;
  missingEnv?: string[];
  rawTextSnippet?: string;
};

function loadDotEnv(path = '.env') {
  if (!existsSync(path)) return;
  const text = readFileSync(path, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

function loadLocalEnvFiles() {
  loadDotEnv('.env');
  loadDotEnv('.env.local');
}

function normalizeEnvAliases() {
  if (!process.env.DATA_GO_KR_PRODUCT_SERVICE_KEY && process.env.DATA_GO_KR_SERVICE_KEY) {
    process.env.DATA_GO_KR_PRODUCT_SERVICE_KEY = process.env.DATA_GO_KR_SERVICE_KEY;
  }
  if (!process.env.KIS_API_KEY && process.env.KIS_APP_KEY) {
    process.env.KIS_API_KEY = process.env.KIS_APP_KEY;
  }
  if (!process.env.KIS_API_SECRET && process.env.KIS_APP_SECRET) {
    process.env.KIS_API_SECRET = process.env.KIS_APP_SECRET;
  }
  if (!process.env.KIWOOM_REST_API_KEY && process.env.KIWOOM_APP_KEY) {
    process.env.KIWOOM_REST_API_KEY = process.env.KIWOOM_APP_KEY;
  }
  if (!process.env.KIWOOM_REST_API_SECRET && process.env.KIWOOM_SECRET_KEY) {
    process.env.KIWOOM_REST_API_SECRET = process.env.KIWOOM_SECRET_KEY;
  }
  if (!process.env.POLYGON_API_KEY && process.env.MASSIVE_S3_SECRET_ACCESS_KEY) {
    process.env.POLYGON_API_KEY = process.env.MASSIVE_S3_SECRET_ACCESS_KEY;
  }
}

function missingEnv(keys: string[]) {
  return keys.filter((key) => !process.env[key]);
}

function maskedUrl(input: string) {
  try {
    const url = new URL(input);
    for (const key of [...url.searchParams.keys()]) {
      if (/key|token|secret|apikey|api_token|crtfc_key|serviceKey/i.test(key)) {
        url.searchParams.set(key, '***');
      }
    }
    return url.toString();
  } catch {
    return input;
  }
}

function sanitizeSnippet(text: string) {
  return text
    .replace(/"access_token"\s*:\s*"[^"]+"/g, '"access_token":"***"')
    .replace(/"token"\s*:\s*"[^"]+"/g, '"token":"***"')
    .replace(/"appsecret"\s*:\s*"[^"]+"/g, '"appsecret":"***"')
    .replace(/"secretkey"\s*:\s*"[^"]+"/g, '"secretkey":"***"');
}

async function fetchJson(endpoint: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: unknown; rawTextSnippet: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(endpoint, { ...init, signal: controller.signal, cache: 'no-store' });
    const text = await response.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }
    return { ok: response.ok, status: response.status, data, rawTextSnippet: sanitizeSnippet(text.slice(0, 500)) };
  } finally {
    clearTimeout(timeout);
  }
}

function skipped(provider: string, endpoint: string, keys: string[]): SmokeResult {
  return { provider, ok: false, endpoint, missingEnv: keys, error: 'missing_env' };
}

async function safe(provider: string, endpoint: string, run: () => Promise<SmokeResult>): Promise<SmokeResult> {
  try {
    return await run();
  } catch (error) {
    return { provider, ok: false, endpoint: maskedUrl(endpoint), error: error instanceof Error ? error.message : 'unknown error' };
  }
}

async function dataGoKrStock(): Promise<SmokeResult> {
  const missing = missingEnv(['DATA_GO_KR_SERVICE_KEY']);
  const endpoint = 'https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo';
  if (missing.length) return skipped('data.go.kr-stock', endpoint, missing);
  const url = new URL(endpoint);
  url.searchParams.set('serviceKey', process.env.DATA_GO_KR_SERVICE_KEY ?? '');
  url.searchParams.set('resultType', 'json');
  url.searchParams.set('numOfRows', '1');
  url.searchParams.set('likeSrtnCd', '005930');
  return safe('data.go.kr-stock', url.toString(), async () => {
    const result = await fetchJson(url.toString());
    const body = result.data as { response?: { body?: { items?: { item?: unknown[] | Record<string, unknown> } }; header?: { resultCode?: string; resultMsg?: string } } } | null;
    const item = body?.response?.body?.items?.item;
    const count = Array.isArray(item) ? item.length : item ? 1 : 0;
    return { provider: 'data.go.kr-stock', ok: result.ok && count > 0, status: result.status, endpoint: maskedUrl(url.toString()), summary: count ? `005930 rows ${count}` : body?.response?.header?.resultMsg, rawTextSnippet: result.rawTextSnippet };
  });
}

async function dataGoKrEtf(): Promise<SmokeResult> {
  const missing = missingEnv(['DATA_GO_KR_PRODUCT_SERVICE_KEY']);
  const endpoint = 'https://apis.data.go.kr/1160100/service/GetSecuritiesProductInfoService/getETFPriceInfo';
  if (missing.length) return skipped('data.go.kr-etf', endpoint, missing);
  const url = new URL(endpoint);
  url.searchParams.set('serviceKey', process.env.DATA_GO_KR_PRODUCT_SERVICE_KEY ?? '');
  url.searchParams.set('resultType', 'json');
  url.searchParams.set('numOfRows', '1');
  url.searchParams.set('likeSrtnCd', '069500');
  return safe('data.go.kr-etf', url.toString(), async () => {
    const result = await fetchJson(url.toString());
    const body = result.data as { response?: { body?: { items?: { item?: unknown[] | Record<string, unknown> } }; header?: { resultMsg?: string } } } | null;
    const item = body?.response?.body?.items?.item;
    const count = Array.isArray(item) ? item.length : item ? 1 : 0;
    return { provider: 'data.go.kr-etf', ok: result.ok && count > 0, status: result.status, endpoint: maskedUrl(url.toString()), summary: count ? `069500 rows ${count}` : body?.response?.header?.resultMsg, rawTextSnippet: result.rawTextSnippet };
  });
}

async function openDart(): Promise<SmokeResult> {
  const missing = missingEnv(['OPENDART_API_KEY']);
  const endpoint = 'https://opendart.fss.or.kr/api/list.json';
  if (missing.length) return skipped('opendart', endpoint, missing);
  const url = new URL(endpoint);
  url.searchParams.set('crtfc_key', process.env.OPENDART_API_KEY ?? '');
  url.searchParams.set('corp_code', '00126380');
  url.searchParams.set('bgn_de', `${new Date().getFullYear()}0101`);
  url.searchParams.set('page_count', '5');
  return safe('opendart', url.toString(), async () => {
    const result = await fetchJson(url.toString());
    const data = result.data as { status?: string; message?: string; list?: unknown[] } | null;
    return { provider: 'opendart', ok: result.ok && data?.status === '000' && Boolean(data.list?.length), status: result.status, endpoint: maskedUrl(url.toString()), summary: data?.list?.length ? `filings ${data.list.length}` : `${data?.status ?? ''} ${data?.message ?? ''}`.trim(), rawTextSnippet: result.rawTextSnippet };
  });
}

async function naverNews(): Promise<SmokeResult> {
  const missing = missingEnv(['NAVER_CLIENT_ID', 'NAVER_CLIENT_SECRET']);
  const endpoint = 'https://openapi.naver.com/v1/search/news.json';
  if (missing.length) return skipped('naver-news', endpoint, missing);
  const url = new URL(endpoint);
  url.searchParams.set('query', '삼성전자');
  url.searchParams.set('display', '3');
  url.searchParams.set('sort', 'date');
  return safe('naver-news', url.toString(), async () => {
    const result = await fetchJson(url.toString(), {
      headers: {
        'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID ?? '',
        'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET ?? '',
      },
    });
    const data = result.data as { items?: unknown[]; errorMessage?: string } | null;
    return { provider: 'naver-news', ok: result.ok && Boolean(data?.items?.length), status: result.status, endpoint: maskedUrl(url.toString()), summary: data?.items?.length ? `items ${data.items.length}` : data?.errorMessage, rawTextSnippet: result.rawTextSnippet };
  });
}

async function alpaca(): Promise<SmokeResult> {
  const missing = missingEnv(['ALPACA_API_KEY_ID', 'ALPACA_API_SECRET_KEY']);
  const endpoint = `${process.env.ALPACA_DATA_BASE_URL || 'https://data.alpaca.markets/v2'}/stocks/AAPL/snapshot`;
  if (missing.length) return skipped('alpaca', endpoint, missing);
  return safe('alpaca', endpoint, async () => {
    const result = await fetchJson(endpoint, {
      headers: {
        'APCA-API-KEY-ID': process.env.ALPACA_API_KEY_ID ?? '',
        'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET_KEY ?? '',
      },
    });
    const data = result.data as { dailyBar?: { c?: number }; message?: string } | null;
    return { provider: 'alpaca', ok: result.ok && Boolean(data?.dailyBar?.c), status: result.status, endpoint: maskedUrl(endpoint), summary: data?.dailyBar?.c ? `AAPL daily close ${data.dailyBar.c}` : data?.message, rawTextSnippet: result.rawTextSnippet };
  });
}

async function fmp(): Promise<SmokeResult> {
  const missing = missingEnv(['FMP_API_KEY']);
  const endpoint = 'https://financialmodelingprep.com/stable/quote';
  if (missing.length) return skipped('fmp', endpoint, missing);
  const url = new URL(endpoint);
  url.searchParams.set('symbol', 'AAPL');
  url.searchParams.set('apikey', process.env.FMP_API_KEY ?? '');
  return safe('fmp', url.toString(), async () => {
    const result = await fetchJson(url.toString());
    const data = result.data as Array<{ price?: number }> | { Error?: string } | null;
    const item = Array.isArray(data) ? data[0] : null;
    return { provider: 'fmp', ok: result.ok && Boolean(item?.price), status: result.status, endpoint: maskedUrl(url.toString()), summary: item?.price ? `AAPL ${item.price}` : JSON.stringify(data).slice(0, 120), rawTextSnippet: result.rawTextSnippet };
  });
}

async function alphaVantage(): Promise<SmokeResult> {
  const missing = missingEnv(['ALPHA_VANTAGE_API_KEY']);
  const endpoint = 'https://www.alphavantage.co/query';
  if (missing.length) return skipped('alpha-vantage', endpoint, missing);
  const url = new URL(endpoint);
  url.searchParams.set('function', 'GLOBAL_QUOTE');
  url.searchParams.set('symbol', 'AAPL');
  url.searchParams.set('apikey', process.env.ALPHA_VANTAGE_API_KEY ?? '');
  return safe('alpha-vantage', url.toString(), async () => {
    const result = await fetchJson(url.toString());
    const data = result.data as { 'Global Quote'?: Record<string, string>; Note?: string; Information?: string } | null;
    const price = data?.['Global Quote']?.['05. price'];
    return { provider: 'alpha-vantage', ok: result.ok && Boolean(price), status: result.status, endpoint: maskedUrl(url.toString()), summary: price ? `AAPL ${price}` : data?.Note ?? data?.Information, rawTextSnippet: result.rawTextSnippet };
  });
}

async function twelveData(): Promise<SmokeResult> {
  const missing = missingEnv(['TWELVE_DATA_API_KEY']);
  const endpoint = 'https://api.twelvedata.com/quote';
  if (missing.length) return skipped('twelve-data', endpoint, missing);
  const url = new URL(endpoint);
  url.searchParams.set('symbol', 'AAPL');
  url.searchParams.set('apikey', process.env.TWELVE_DATA_API_KEY ?? '');
  return safe('twelve-data', url.toString(), async () => {
    const result = await fetchJson(url.toString());
    const data = result.data as { close?: string; message?: string; status?: string } | null;
    return { provider: 'twelve-data', ok: result.ok && Boolean(data?.close), status: result.status, endpoint: maskedUrl(url.toString()), summary: data?.close ? `AAPL ${data.close}` : `${data?.status ?? ''} ${data?.message ?? ''}`.trim(), rawTextSnippet: result.rawTextSnippet };
  });
}

async function marketaux(): Promise<SmokeResult> {
  const missing = missingEnv(['MARKETAUX_API_TOKEN']);
  const endpoint = 'https://api.marketaux.com/v1/news/all';
  if (missing.length) return skipped('marketaux', endpoint, missing);
  const url = new URL(endpoint);
  url.searchParams.set('api_token', process.env.MARKETAUX_API_TOKEN ?? '');
  url.searchParams.set('symbols', 'AAPL');
  url.searchParams.set('language', 'en');
  url.searchParams.set('limit', '3');
  url.searchParams.set('filter_entities', 'true');
  return safe('marketaux', url.toString(), async () => {
    const result = await fetchJson(url.toString());
    const data = result.data as { data?: unknown[]; error?: { message?: string } } | null;
    return { provider: 'marketaux', ok: result.ok && Boolean(data?.data?.length), status: result.status, endpoint: maskedUrl(url.toString()), summary: data?.data?.length ? `articles ${data.data.length}` : data?.error?.message, rawTextSnippet: result.rawTextSnippet };
  });
}

async function polygonMassive(): Promise<SmokeResult> {
  const missing = missingEnv(['POLYGON_API_KEY']);
  const endpoint = 'https://api.polygon.io/v2/aggs/ticker/AAPL/prev';
  if (missing.length) return skipped('polygon-massive', endpoint, missing);
  const url = new URL(endpoint);
  url.searchParams.set('adjusted', 'true');
  url.searchParams.set('apiKey', process.env.POLYGON_API_KEY ?? '');
  return safe('polygon-massive', url.toString(), async () => {
    const result = await fetchJson(url.toString());
    const data = result.data as { status?: string; results?: Array<{ c?: number }>; error?: string; message?: string } | null;
    return { provider: 'polygon-massive', ok: result.ok && Boolean(data?.results?.[0]?.c), status: result.status, endpoint: maskedUrl(url.toString()), summary: data?.results?.[0]?.c ? `AAPL prev close ${data.results[0].c}` : data?.error ?? data?.message ?? data?.status, rawTextSnippet: result.rawTextSnippet };
  });
}

async function fred(): Promise<SmokeResult> {
  const missing = missingEnv(['FRED_API_KEY']);
  const endpoint = 'https://api.stlouisfed.org/fred/series/observations';
  if (missing.length) return skipped('fred', endpoint, missing);
  const url = new URL(endpoint);
  url.searchParams.set('series_id', 'DGS10');
  url.searchParams.set('api_key', process.env.FRED_API_KEY ?? '');
  url.searchParams.set('file_type', 'json');
  url.searchParams.set('sort_order', 'desc');
  url.searchParams.set('limit', '1');
  return safe('fred', url.toString(), async () => {
    const result = await fetchJson(url.toString());
    const data = result.data as { observations?: Array<{ value?: string; date?: string }>; error_message?: string } | null;
    const item = data?.observations?.[0];
    return { provider: 'fred', ok: result.ok && Boolean(item?.value), status: result.status, endpoint: maskedUrl(url.toString()), summary: item ? `DGS10 ${item.date} ${item.value}` : data?.error_message, rawTextSnippet: result.rawTextSnippet };
  });
}

async function bls(): Promise<SmokeResult> {
  const missing = missingEnv(['BLS_API_KEY']);
  const endpoint = 'https://api.bls.gov/publicAPI/v2/timeseries/data/';
  if (missing.length) return skipped('bls', endpoint, missing);
  return safe('bls', endpoint, async () => {
    const result = await fetchJson(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seriesid: ['LNS14000000'], startyear: '2025', endyear: '2026', registrationkey: process.env.BLS_API_KEY }),
    });
    const data = result.data as { status?: string; Results?: { series?: Array<{ data?: unknown[] }> }; message?: string[] } | null;
    const count = data?.Results?.series?.[0]?.data?.length ?? 0;
    return { provider: 'bls', ok: result.ok && data?.status === 'REQUEST_SUCCEEDED' && count > 0, status: result.status, endpoint, summary: count ? `LNS14000000 rows ${count}` : data?.message?.join('; '), rawTextSnippet: result.rawTextSnippet };
  });
}

async function coinalyze(): Promise<SmokeResult> {
  const missing = missingEnv(['COINALYZE_API_KEY']);
  const endpoint = 'https://api.coinalyze.net/v1/open-interest';
  if (missing.length) return skipped('coinalyze', endpoint, missing);
  const url = new URL(endpoint);
  url.searchParams.set('symbols', 'BTCUSDT_PERP.A');
  url.searchParams.set('convert_to_usd', 'true');
  return safe('coinalyze', url.toString(), async () => {
    const result = await fetchJson(url.toString(), { headers: { api_key: process.env.COINALYZE_API_KEY ?? '' } });
    const data = result.data as Array<{ value?: number; open_interest?: number }> | { error?: string } | null;
    const first = Array.isArray(data) ? data[0] : null;
    return { provider: 'coinalyze', ok: result.ok && Boolean(first), status: result.status, endpoint: maskedUrl(url.toString()), summary: first ? `rows ${Array.isArray(data) ? data.length : 0}` : JSON.stringify(data).slice(0, 120), rawTextSnippet: result.rawTextSnippet };
  });
}

async function kisToken(): Promise<SmokeResult> {
  const missing = missingEnv(['KIS_API_KEY', 'KIS_API_SECRET']);
  const endpoint = 'https://openapi.koreainvestment.com:9443/oauth2/tokenP';
  if (missing.length) return skipped('kis-token', endpoint, missing);
  return safe('kis-token', endpoint, async () => {
    const result = await fetchJson(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grant_type: 'client_credentials', appkey: process.env.KIS_API_KEY, appsecret: process.env.KIS_API_SECRET }),
    });
    const data = result.data as { access_token?: string; error_code?: string; error_description?: string; msg1?: string } | null;
    const throttledAfterRecentIssue = data?.error_code === 'EGW00133';
    return { provider: 'kis-token', ok: (result.ok && Boolean(data?.access_token)) || throttledAfterRecentIssue, status: result.status, endpoint, summary: data?.access_token ? 'token issued' : throttledAfterRecentIssue ? 'token endpoint reachable; official 1/min issue limit hit' : data?.error_description ?? data?.msg1, rawTextSnippet: result.rawTextSnippet };
  });
}

async function kiwoomToken(): Promise<SmokeResult> {
  const missing = missingEnv(['KIWOOM_REST_API_KEY', 'KIWOOM_REST_API_SECRET']);
  const endpoint = 'https://api.kiwoom.com/oauth2/token';
  if (missing.length) return skipped('kiwoom-token', endpoint, missing);
  return safe('kiwoom-token', endpoint, async () => {
    const result = await fetchJson(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      body: JSON.stringify({ grant_type: 'client_credentials', appkey: process.env.KIWOOM_REST_API_KEY, secretkey: process.env.KIWOOM_REST_API_SECRET }),
    });
    const data = result.data as { token?: string; access_token?: string; return_msg?: string; message?: string } | null;
    return { provider: 'kiwoom-token', ok: result.ok && Boolean(data?.token ?? data?.access_token), status: result.status, endpoint, summary: data?.token || data?.access_token ? 'token issued' : data?.return_msg ?? data?.message, rawTextSnippet: result.rawTextSnippet };
  });
}

async function kiwoomKrShortFlow(): Promise<SmokeResult> {
  const missing = missingEnv(['KIWOOM_REST_API_KEY', 'KIWOOM_REST_API_SECRET']);
  const endpoint = 'https://api.kiwoom.com/api/dostk/shsa';
  if (missing.length) return skipped('kiwoom-kr-short-flow', endpoint, missing);
  return safe('kiwoom-kr-short-flow', endpoint, async () => {
    const tokenResult = await fetchJson('https://api.kiwoom.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      body: JSON.stringify({ grant_type: 'client_credentials', appkey: process.env.KIWOOM_REST_API_KEY, secretkey: process.env.KIWOOM_REST_API_SECRET }),
    });
    const tokenData = tokenResult.data as { token?: string; return_msg?: string } | null;
    if (!tokenData?.token) {
      return { provider: 'kiwoom-kr-short-flow', ok: false, status: tokenResult.status, endpoint, summary: tokenData?.return_msg ?? 'token failed', rawTextSnippet: tokenResult.rawTextSnippet };
    }
    const end = new Date();
    const start = new Date(end.getTime() - 20 * 24 * 60 * 60 * 1000);
    const ymd = (date: Date) => date.toISOString().slice(0, 10).replace(/-/g, '');
    const kiwoomSymbol = 'KRX:005930';
    async function call(name: string, apiId: string, path: string, body: Record<string, string>) {
      const result = await fetchJson(`https://api.kiwoom.com${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          authorization: `Bearer ${tokenData.token}`,
          'api-id': apiId,
          'cont-yn': 'N',
          'next-key': '',
        },
        body: JSON.stringify(body),
      });
      const data = result.data as { return_code?: number; return_msg?: string; [key: string]: unknown } | null;
      return { name, status: result.status, ok: result.ok && data?.return_code === 0, data, snippet: result.rawTextSnippet };
    }
    const short = await call('short', 'ka10014', '/api/dostk/shsa', { stk_cd: kiwoomSymbol, strt_dt: ymd(start), end_dt: ymd(end) });
    const lending = await call('lending', 'ka20068', '/api/dostk/slb', { stk_cd: kiwoomSymbol });
    const investor = await call('investor', 'ka10060', '/api/dostk/chart', { stk_cd: kiwoomSymbol, dt: ymd(new Date(end.getTime() - 24 * 60 * 60 * 1000)), amt_qty_tp: '1', trde_tp: '0', unit_tp: '1' });
    const shortRows = Array.isArray(short.data?.shrts_trnsn) ? short.data.shrts_trnsn.length : 0;
    const lendingRows = Array.isArray(lending.data?.dbrt_trde_trnsn) ? lending.data.dbrt_trde_trnsn.length : 0;
    const investorRows = Array.isArray(investor.data?.stk_invsr_orgn_chart) ? investor.data.stk_invsr_orgn_chart.length : 0;
    const ok = short.ok && lending.ok && investor.ok && shortRows > 0 && lendingRows > 0 && investorRows > 0;
    return {
      provider: 'kiwoom-kr-short-flow',
      ok,
      status: short.status,
      endpoint,
      summary: `short ${shortRows}, lending ${lendingRows}, investor ${investorRows}`,
      rawTextSnippet: sanitizeSnippet(JSON.stringify({ short: short.data, lending: lending.data, investor: investor.data }).slice(0, 500)),
    };
  });
}

function krx(): SmokeResult {
  const missing = missingEnv(['KRX_OPENAPI_AUTH_KEY']);
  const apiIds = missingEnv(['KRX_SHORT_SELLING_API_ID', 'KRX_INVESTOR_FLOW_API_ID']);
  if (missing.length) return skipped('krx', 'KRX Open API', missing);
  if (apiIds.length) return { provider: 'krx', ok: false, endpoint: 'KRX Open API', missingEnv: apiIds, error: 'api_id_missing', summary: 'Auth key exists, but short selling/investor flow API IDs are required before runtime calls.' };
  return { provider: 'krx', ok: false, endpoint: 'KRX Open API', error: 'not_called', summary: 'API IDs configured but endpoint format is not implemented in smoke script yet.' };
}

async function dbConnection(): Promise<SmokeResult> {
  const endpoint = 'DATABASE_URL';
  if (!process.env.DATABASE_URL) {
    return skipped('database', endpoint, ['DATABASE_URL']);
  }
  return safe('database', endpoint, async () => {
    const { Client } = await import('pg');
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const result = await client.query('select now() as now');
    await client.end();
    return {
      provider: 'database',
      ok: Boolean(result.rows[0]?.now),
      endpoint,
      summary: result.rows[0]?.now ? 'connection ok' : 'connection no rows',
    };
  });
}

async function main() {
  loadLocalEnvFiles();
  normalizeEnvAliases();
  const checks = [
    dataGoKrStock(),
    dataGoKrEtf(),
    openDart(),
    naverNews(),
    alpaca(),
    fmp(),
    alphaVantage(),
    twelveData(),
    marketaux(),
    polygonMassive(),
    fred(),
    bls(),
    coinalyze(),
    kisToken(),
    kiwoomToken(),
    kiwoomKrShortFlow(),
    dbConnection(),
    Promise.resolve(krx()),
  ];
  const results = await Promise.all(checks);
  const summary = {
    ok: results.some((result) => result.ok),
    passed: results.filter((result) => result.ok).length,
    failed: results.filter((result) => !result.ok && !result.missingEnv?.length).length,
    missing: results.filter((result) => result.missingEnv?.length).length,
  };
  console.log(JSON.stringify({ summary, results }, null, 2));
  if (!summary.ok) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
