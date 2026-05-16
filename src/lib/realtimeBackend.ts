import 'server-only';

import { readFile } from 'node:fs/promises';
import path from 'node:path';

export type LiveAlertTrigger = {
  alertId: string;
  anonUserId: string;
  cardKey: string;
  assetKey?: string | null;
  formulaKey?: string | null;
  triggeredAt: string;
  triggerBasis?: {
    fitScore?: number;
    alertLine?: string;
    matchedReasons?: string[];
    riskTags?: string[];
  };
  metadata?: {
    source?: string;
    symbol?: string;
    formulaName?: string;
    selectorScore?: number | null;
    selectorReasons?: string[];
    deliveryStatus?: string;
    pushPreview?: string;
  };
};

export type LiveFormulaSignal = {
  symbol: string;
  name: string;
  market: string;
  market_label: string;
  theme?: string | null;
  formula_key: string;
  formula_name: string;
  triggered_at: string;
  fit_score: number;
  alert_line: string;
  matched_reasons: string[];
  risk_tags: string[];
  latest_bar: {
    time?: number;
    close?: number;
    cumAmount?: number;
    changePct?: number;
  };
  technical_snapshot?: Record<string, unknown> | null;
  selector_score?: number | null;
  selector_reasons?: string[] | null;
};

async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(filePath, 'utf-8')) as T;
  } catch {
    return null;
  }
}

export async function getLiveRuntimeFeed() {
  return readJson<{ generatedAt?: string; items?: unknown[]; cards?: unknown[] }>(
    path.join(process.cwd(), 'runtime_output', 'realtime_signals', 'frontend', 'live-feed.json'),
  );
}

export async function getLiveAlertTriggers(limit = 20): Promise<LiveAlertTrigger[]> {
  const payload = await readJson<{ items?: LiveAlertTrigger[]; triggers?: LiveAlertTrigger[] }>(
    path.join(process.cwd(), 'runtime_output', 'realtime_signals', 'frontend', 'live-alert-triggers.json'),
  );
  return (payload?.triggers ?? payload?.items ?? []).slice(0, limit);
}

export async function getLiveFormulaSignals(limit = 100): Promise<LiveFormulaSignal[]> {
  const payload = await readJson<{ signals?: LiveFormulaSignal[] }>(
    path.join(process.cwd(), 'runtime_output', 'realtime_signals', 'formula_signals_latest.json'),
  );
  return (payload?.signals ?? []).slice(0, limit);
}
