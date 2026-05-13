'use client';

export const anonUserStorageKey = 'stock-app-anonymous-id';
const syncQueueStorageKey = 'stock-app-sync-queue';

export type PendingSyncItem = {
  id: string;
  url: string;
  method: 'POST' | 'DELETE';
  payload: Record<string, unknown>;
  createdAt: string;
};

export function getAnonymousId() {
  const existing = window.localStorage.getItem(anonUserStorageKey);
  if (existing) {
    return existing;
  }

  const anonymousId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? `anon_${crypto.randomUUID()}`
      : `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(anonUserStorageKey, anonymousId);
  return anonymousId;
}

export async function registerAnonymousUser(metadata: Record<string, unknown> = {}) {
  const anonUserId = getAnonymousId();
  await fetch('/api/anonymous-users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: anonUserId, mixpanelId: anonUserId, ...metadata }),
  });
  return anonUserId;
}

export function readPendingSyncQueue(): PendingSyncItem[] {
  const raw = window.localStorage.getItem(syncQueueStorageKey);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as PendingSyncItem[];
  } catch {
    return [];
  }
}

export function queuePendingSync(item: Omit<PendingSyncItem, 'id' | 'createdAt'>) {
  const next: PendingSyncItem = {
    ...item,
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}_${Math.random()}`,
    createdAt: new Date().toISOString(),
  };
  window.localStorage.setItem(syncQueueStorageKey, JSON.stringify([next, ...readPendingSyncQueue()].slice(0, 200)));
}

export async function flushPendingSyncQueue() {
  const queue = readPendingSyncQueue();
  if (!queue.length) {
    return;
  }

  const failed: PendingSyncItem[] = [];
  for (const item of queue) {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.payload),
      });
      if (!response.ok) {
        failed.push(item);
      }
    } catch {
      failed.push(item);
    }
  }
  window.localStorage.setItem(syncQueueStorageKey, JSON.stringify(failed.slice(0, 200)));
}
