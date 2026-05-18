import type { ProviderFetchOutcome } from '@/lib/providers/types';

const defaultTimeoutMs = 15_000;

function snippet(value: string, maxLength = 700) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

export async function safeProviderFetch<T>(input: {
  provider: string;
  url: string;
  basis: string;
  init?: RequestInit;
  envMissing?: string[];
  timeoutMs?: number;
  retries?: number;
}): Promise<ProviderFetchOutcome<T>> {
  const fetchedAt = new Date().toISOString();
  const envMissing = input.envMissing?.filter(Boolean) ?? [];
  if (envMissing.length) {
    return {
      ok: false,
      provider: input.provider,
      url: input.url,
      basis: input.basis,
      fetchedAt,
      data: null,
      envMissing,
      error: `Missing env: ${envMissing.join(', ')}`,
    };
  }

  const attempts = Math.max(1, (input.retries ?? 0) + 1);
  let lastOutcome: ProviderFetchOutcome<T> | null = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), input.timeoutMs ?? defaultTimeoutMs);
    try {
      const response = await fetch(input.url, {
        ...input.init,
        signal: controller.signal,
        cache: 'no-store',
      });
      const rawText = await response.text();
      if (!response.ok) {
        lastOutcome = {
          ok: false,
          provider: input.provider,
          url: input.url,
          status: response.status,
          basis: input.basis,
          fetchedAt,
          data: null,
          rawText: snippet(rawText),
          error: `HTTP ${response.status}`,
        };
        continue;
      }
      try {
        return {
          ok: true,
          provider: input.provider,
          url: input.url,
          status: response.status,
          basis: input.basis,
          fetchedAt,
          data: rawText ? (JSON.parse(rawText) as T) : (null as T),
          rawText: snippet(rawText),
        };
      } catch (error) {
        lastOutcome = {
          ok: false,
          provider: input.provider,
          url: input.url,
          status: response.status,
          basis: input.basis,
          fetchedAt,
          data: null,
          rawText: snippet(rawText),
          error: error instanceof Error ? `JSON parse failed: ${error.message}` : 'JSON parse failed',
        };
      }
    } catch (error) {
      lastOutcome = {
        ok: false,
        provider: input.provider,
        url: input.url,
        basis: input.basis,
        fetchedAt,
        data: null,
        error: error instanceof Error ? error.message : 'fetch failed',
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  return lastOutcome ?? {
    ok: false,
    provider: input.provider,
    url: input.url,
    basis: input.basis,
    fetchedAt,
    data: null,
    error: 'fetch failed',
  };
}

export async function safeFetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  const outcome = await safeProviderFetch<T>({
    provider: 'legacy',
    url,
    basis: 'legacy fetch',
    init,
  });
  return outcome.ok ? outcome.data : null;
}
