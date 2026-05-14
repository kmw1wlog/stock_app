'use client';

import type { FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';
import { getAnonymousId, queuePendingSync } from './anonymousUser';

export type ConditionAlertDto = {
  id: string;
  anonUserId: string;
  cardKey: string;
  assetKey?: string | null;
  market?: string | null;
  symbol?: string | null;
  formulaKey: string;
  formulaName: string;
  alertScope: string;
  status: string;
  expiresAt?: string | null;
  lastTriggeredAt?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt?: string;
};

const storageKey = 'stock-app-condition-alerts';

function readLocalAlerts(): ConditionAlertDto[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(storageKey) ?? '[]') as ConditionAlertDto[];
  } catch {
    return [];
  }
}

function writeLocalAlerts(alerts: ConditionAlertDto[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(alerts.slice(0, 200)));
}

export function buildAlertPayload(card: DisplayCard, formula: FormulaDefinition) {
  const expiresAt = new Date(Date.now() + formula.defaultExpiresInDays * 24 * 60 * 60 * 1000).toISOString();
  return {
    anonUserId: getAnonymousId(),
    cardKey: card.id,
    assetKey: card.assetKey,
    market: card.market,
    symbol: card.symbol,
    formulaKey: formula.key,
    formulaName: formula.name,
    alertScope: 'asset_formula',
    expiresAt,
    metadata: {
      cardName: card.name,
      formulaShortName: formula.shortName,
      dataBasisLabel: card.dataBasisLabel,
      source: card.source,
    },
  };
}

export async function createConditionAlert(card: DisplayCard, formula: FormulaDefinition) {
  const payload = buildAlertPayload(card, formula);
  const fallbackAlert: ConditionAlertDto = {
    id: `local_${payload.cardKey}_${payload.formulaKey}`,
    ...payload,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const response = await fetch('/api/condition-alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('condition alert create failed');
    const data = (await response.json()) as { item?: ConditionAlertDto };
    const alert = data.item ?? fallbackAlert;
    const next = [alert, ...readLocalAlerts().filter((item) => item.id !== alert.id && !(item.cardKey === alert.cardKey && item.formulaKey === alert.formulaKey))];
    writeLocalAlerts(next);
    return alert;
  } catch {
    const next = [fallbackAlert, ...readLocalAlerts().filter((item) => !(item.cardKey === fallbackAlert.cardKey && item.formulaKey === fallbackAlert.formulaKey))];
    writeLocalAlerts(next);
    queuePendingSync({ url: '/api/condition-alerts', method: 'POST', payload });
    return fallbackAlert;
  }
}

export async function fetchConditionAlerts(anonUserId = getAnonymousId()) {
  try {
    const response = await fetch(`/api/condition-alerts?anonUserId=${encodeURIComponent(anonUserId)}`);
    if (!response.ok) throw new Error('condition alert fetch failed');
    const data = (await response.json()) as { items?: ConditionAlertDto[] };
    const items = data.items ?? [];
    if (items.length) writeLocalAlerts(items);
    return items.length ? items : readLocalAlerts();
  } catch {
    return readLocalAlerts();
  }
}

async function patchAlert(id: string, body: Record<string, unknown>) {
  try {
    const response = await fetch('/api/condition-alerts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...body }),
    });
    if (!response.ok) throw new Error('condition alert patch failed');
    return true;
  } catch {
    const next = readLocalAlerts().map((alert) => (alert.id === id ? { ...alert, ...body, updatedAt: new Date().toISOString() } : alert));
    writeLocalAlerts(next);
    return false;
  }
}

export function extendConditionAlert(id: string, days: number) {
  return patchAlert(id, { status: 'active', expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString() });
}

export function pauseConditionAlert(id: string) {
  return patchAlert(id, { status: 'paused' });
}

export function deleteConditionAlert(id: string) {
  return patchAlert(id, { status: 'deleted' });
}
