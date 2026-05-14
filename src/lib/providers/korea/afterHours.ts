import 'server-only';

import { callKiwoomRest, kiwoomKrFlowMissingEnv } from '@/lib/providers/korea/kiwoomKrData';
import { emptyProviderResult, type ProviderResult } from '@/lib/providers/types';

export type AfterHoursQuote = {
  symbol: string;
  afterPrice?: number;
  afterChangePct?: number;
  afterVolume?: number;
  afterAmount?: number;
  sessionType: 'post_hours' | 'single_price' | 'unknown';
  source: string;
  basis: string;
  raw?: unknown;
};

const basis = '장후 시간외 · Kiwoom REST API ka10087 후보 · EOD 18:20 이후 수집 권장';

function parseNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  const normalized = String(value).replace(/[,+%]/g, '').trim();
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function findFirstRecord(raw: Record<string, unknown>) {
  for (const value of Object.values(raw)) {
    if (Array.isArray(value) && value.length && typeof value[0] === 'object') return value[0] as Record<string, unknown>;
  }
  return raw;
}

function normalizeAfterHours(symbol: string, raw: Record<string, unknown>): AfterHoursQuote {
  const item = findFirstRecord(raw);
  return {
    symbol,
    afterPrice: parseNumber(item.after_pric ?? item.after_price ?? item.cur_prc ?? item.close_pric ?? item.prc),
    afterChangePct: parseNumber(item.flu_rt ?? item.change_rate ?? item.after_flu_rt ?? item.rate),
    afterVolume: parseNumber(item.trde_qty ?? item.volume ?? item.after_trde_qty),
    afterAmount: parseNumber(item.trde_prica ?? item.amount ?? item.after_trde_prica),
    sessionType: 'single_price',
    source: 'kiwoom-rest',
    basis,
    raw,
  };
}

export async function fetchAfterHoursQuote(symbol: string): Promise<ProviderResult<AfterHoursQuote | null>> {
  const missing = kiwoomKrFlowMissingEnv();
  if (missing.length) {
    return emptyProviderResult('kiwoom-rest', `${basis} · API 키 필요: ${missing.join(', ')}`, null);
  }

  try {
    const raw = await callKiwoomRest('ka10087', '/api/dostk/stkinfo', { stk_cd: symbol });
    return emptyProviderResult('kiwoom-rest', basis, normalizeAfterHours(symbol, raw));
  } catch (error) {
    return emptyProviderResult('kiwoom-rest', `${basis} · 조회 실패: ${error instanceof Error ? error.message : String(error)}`, null);
  }
}

export async function fetchAfterHoursQuotes(symbols: string[]): Promise<ProviderResult<AfterHoursQuote[]>> {
  const quotes: AfterHoursQuote[] = [];
  for (const symbol of symbols) {
    const result = await fetchAfterHoursQuote(symbol);
    if (result.data) quotes.push(result.data);
  }
  return emptyProviderResult('kiwoom-rest', basis, quotes);
}
