'use client';

import { getAnonymousId, queuePendingSync } from './anonymousUser';

export type UserCardStateAction = 'saved' | 'liked' | 'hidden' | 'result_tracking';

export async function syncUserCardState(input: {
  cardKey: string;
  state: UserCardStateAction;
  assetKey?: string;
  market?: string;
  source?: string;
  metadata?: Record<string, unknown>;
}) {
  const payload = { anonUserId: getAnonymousId(), ...input };
  try {
    const response = await fetch('/api/user-card-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('state sync failed');
    }
  } catch {
    queuePendingSync({ url: '/api/user-card-state', method: 'POST', payload });
  }
}

export async function syncUserFormulaState(input: {
  cardKey: string;
  platform: string;
  action: string;
  metadata?: Record<string, unknown>;
}) {
  const payload = { anonUserId: getAnonymousId(), ...input };
  try {
    const response = await fetch('/api/user-formula-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('formula sync failed');
    }
  } catch {
    queuePendingSync({ url: '/api/user-formula-state', method: 'POST', payload });
  }
}
