import 'server-only';

import type { ProviderResult } from '@/lib/providers/types';

type KiwoomTokenResponse = {
  token?: string;
  token_type?: string;
  expires_dt?: string;
  return_code?: number;
  return_msg?: string;
};

type KiwoomApiResponse = {
  return_code?: number;
  return_msg?: string;
  [key: string]: unknown;
};

export type KiwoomShortSellingRow = {
  dt?: string;
  close_pric?: string;
  flu_rt?: string;
  trde_qty?: string;
  shrts_qty?: string;
  ovr_shrts_qty?: string;
  trde_wght?: string;
  shrts_trde_prica?: string;
  shrts_avg_pric?: string;
};

export type KiwoomLendingRow = {
  dt?: string;
  dbrt_trde_cntrcnt?: string;
  dbrt_trde_rpy?: string;
  dbrt_trde_irds?: string;
  rmnd?: string;
  remn_amt?: string;
};

export type KiwoomInvestorRow = {
  dt?: string;
  cur_prc?: string;
  flu_rt?: string;
  acc_trde_qty?: string;
  acc_trde_prica?: string;
  ind_invsr?: string;
  frgnr_invsr?: string;
  orgn?: string;
  fnnc_invt?: string;
  insrnc?: string;
  invtrt?: string;
  bank?: string;
  penfnd_etc?: string;
  natn?: string;
  etc_corp?: string;
  natfor?: string;
};

export type KiwoomKrFlowData = {
  symbol: string;
  source: 'kiwoom-rest';
  basis: string;
  refreshCadence: string;
  shortSellingRows: KiwoomShortSellingRow[];
  lendingRows: KiwoomLendingRow[];
  investorRows: KiwoomInvestorRow[];
  latestShortSelling?: {
    date?: string;
    shortVolume?: number;
    shortTradeValue?: number;
    shortWeightPct?: number;
    shortAvgPrice?: number;
  };
  latestLending?: {
    date?: string;
    balance?: number;
    balanceAmount?: number;
    netChange?: number;
  };
  latestInvestor?: {
    date?: string;
    individual?: number;
    foreigner?: number;
    institution?: number;
    financeInvestment?: number;
    pension?: number;
  };
};

const basis = '일별 기준 · Kiwoom REST API';
const refreshCadence = '장중 15분, 장마감 후 1시간, 휴장일 1일 1회 권장';
let cachedToken: { token: string; expiresAt: number } | null = null;
let cachedFlow: { key: string; expiresAt: number; result: ProviderResult<KiwoomKrFlowData> } | null = null;

function envMissing() {
  return ['KIWOOM_REST_API_KEY', 'KIWOOM_REST_API_SECRET'].filter((key) => !process.env[key]);
}

function parseNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  const normalized = String(value).replace(/[,+]/g, '').trim();
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function dateRange(days = 20) {
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  const ymd = (date: Date) => date.toISOString().slice(0, 10).replace(/-/g, '');
  return { start: ymd(start), end: ymd(end) };
}

function tokenExpiresAt(expiresDt?: string) {
  if (!expiresDt || !/^\d{14}$/.test(expiresDt)) return Date.now() + 55 * 60 * 1000;
  const year = Number(expiresDt.slice(0, 4));
  const month = Number(expiresDt.slice(4, 6)) - 1;
  const day = Number(expiresDt.slice(6, 8));
  const hour = Number(expiresDt.slice(8, 10));
  const minute = Number(expiresDt.slice(10, 12));
  const second = Number(expiresDt.slice(12, 14));
  return new Date(year, month, day, hour, minute, second).getTime() - 60_000;
}

async function getKiwoomToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;
  const missing = envMissing();
  if (missing.length) throw new Error(`Missing env: ${missing.join(', ')}`);

  const response = await fetch('https://api.kiwoom.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json;charset=UTF-8' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      appkey: process.env.KIWOOM_REST_API_KEY,
      secretkey: process.env.KIWOOM_REST_API_SECRET,
    }),
    cache: 'no-store',
  });
  const data = (await response.json()) as KiwoomTokenResponse;
  if (!response.ok || !data.token || data.return_code !== 0) {
    throw new Error(data.return_msg || `Kiwoom token failed: HTTP ${response.status}`);
  }
  cachedToken = { token: data.token, expiresAt: tokenExpiresAt(data.expires_dt) };
  return data.token;
}

async function callKiwoom(apiId: string, path: string, body: Record<string, string>) {
  const token = await getKiwoomToken();
  const response = await fetch(`https://api.kiwoom.com${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      authorization: `Bearer ${token}`,
      'api-id': apiId,
      'cont-yn': 'N',
      'next-key': '',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const data = (await response.json()) as KiwoomApiResponse;
  if (!response.ok || data.return_code !== 0) {
    throw new Error(`${apiId}: ${data.return_msg || `HTTP ${response.status}`}`);
  }
  return data;
}

function asRows<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export async function fetchKiwoomKrFlow(symbol = '005930'): Promise<ProviderResult<KiwoomKrFlowData>> {
  const cacheKey = symbol;
  if (cachedFlow && cachedFlow.key === cacheKey && cachedFlow.expiresAt > Date.now()) return cachedFlow.result;

  const { start, end } = dateRange(20);
  const shortSelling = await callKiwoom('ka10014', '/api/dostk/shsa', { stk_cd: symbol, strt_dt: start, end_dt: end });
  const lending = await callKiwoom('ka20068', '/api/dostk/slb', { stk_cd: symbol });
  const investor = await callKiwoom('ka10059', '/api/dostk/stkinfo', { stk_cd: symbol, dt: end, amt_qty_tp: '1', trde_tp: '0', unit_tp: '1' });

  const shortSellingRows = asRows<KiwoomShortSellingRow>(shortSelling.shrts_trnsn);
  const lendingRows = asRows<KiwoomLendingRow>(lending.dbrt_trde_trnsn);
  const investorRows = asRows<KiwoomInvestorRow>(investor.stk_invsr_orgn);
  const latestShort = shortSellingRows[0];
  const latestLending = lendingRows[0];
  const latestInvestor = investorRows[0];

  const result: ProviderResult<KiwoomKrFlowData> = {
    source: 'kiwoom-rest',
    basis,
    fetchedAt: new Date().toISOString(),
    data: {
      symbol,
      source: 'kiwoom-rest',
      basis,
      refreshCadence,
      shortSellingRows,
      lendingRows,
      investorRows,
      latestShortSelling: latestShort ? {
        date: latestShort.dt,
        shortVolume: parseNumber(latestShort.shrts_qty),
        shortTradeValue: parseNumber(latestShort.shrts_trde_prica),
        shortWeightPct: parseNumber(latestShort.trde_wght),
        shortAvgPrice: parseNumber(latestShort.shrts_avg_pric),
      } : undefined,
      latestLending: latestLending ? {
        date: latestLending.dt,
        balance: parseNumber(latestLending.rmnd),
        balanceAmount: parseNumber(latestLending.remn_amt),
        netChange: parseNumber(latestLending.dbrt_trde_irds),
      } : undefined,
      latestInvestor: latestInvestor ? {
        date: latestInvestor.dt,
        individual: parseNumber(latestInvestor.ind_invsr),
        foreigner: parseNumber(latestInvestor.frgnr_invsr),
        institution: parseNumber(latestInvestor.orgn),
        financeInvestment: parseNumber(latestInvestor.fnnc_invt),
        pension: parseNumber(latestInvestor.penfnd_etc),
      } : undefined,
    },
    raw: { shortSelling, lending, investor },
  };
  cachedFlow = { key: cacheKey, expiresAt: Date.now() + 10 * 60 * 1000, result };
  return result;
}

export function kiwoomKrFlowMissingEnv() {
  return envMissing();
}
