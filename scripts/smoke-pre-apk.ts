const baseUrl = process.env.SMOKE_BASE_URL || 'http://localhost:3000';

type JsonObject = Record<string, unknown>;

type SmokeResult = {
  method: string;
  path: string;
  durationMs: number;
  status: number;
  body: string;
  json: JsonObject | null;
};

class TimeoutError extends Error {
  constructor(
    public readonly method: string,
    public readonly path: string,
    public readonly timeoutMs: number,
  ) {
    super(`${method} ${path} timeout after ${timeoutMs}ms`);
  }
}

async function fetchWithTimeout(
  method: string,
  path: string,
  timeoutMs: number,
  init?: RequestInit,
): Promise<SmokeResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      method,
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'content-type': 'application/json',
        ...(init?.headers || {}),
      },
    });
    const body = await response.text();
    let json: JsonObject | null = null;
    try {
      json = JSON.parse(body) as JsonObject;
    } catch {
      json = null;
    }
    return {
      method,
      path,
      durationMs: Date.now() - started,
      status: response.status,
      body,
      json,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new TimeoutError(method, path, timeoutMs);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function printPass(message: string) {
  console.log(`[PASS] ${message}`);
}

function printFail(message: string) {
  console.error(`[FAIL] ${message}`);
}

function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function ensureJsonOk(result: SmokeResult) {
  ensure(result.status >= 200 && result.status < 300, `${result.method} ${result.path} status=${result.status}`);
  ensure(result.json && result.json.ok === true, `${result.method} ${result.path} missing ok=true`);
}

async function runGet(path: string, timeoutMs: number, extra?: (result: SmokeResult) => string) {
  const result = await fetchWithTimeout('GET', path, timeoutMs);
  ensureJsonOk(result);
  const suffix = extra ? ` ${extra(result)}` : '';
  printPass(`GET ${path} ${result.durationMs}ms${suffix}`);
}

async function runPage(path: string, timeoutMs: number) {
  const result = await fetchWithTimeout('GET', path, timeoutMs, {
    headers: {
      accept: 'text/html',
    },
  });
  ensure(result.status >= 200 && result.status < 300, `GET ${path} status=${result.status}`);
  ensure(result.body.length > 0, `GET ${path} returned empty body`);
  printPass(`GET ${path} ${result.durationMs}ms`);
}

async function runConditionAlertsCrud(timeoutMs: number) {
  const anonUserId = 'smoke_pre_apk_user';
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const postPayload = {
    anonUserId,
    cardKey: 'smoke_card_005930',
    assetKey: 'KR:005930',
    market: 'KR',
    symbol: '005930',
    formulaKey: 'A_volume_spike',
    formulaName: '거래량 폭발형',
    alertScope: 'asset_formula',
    expiresAt,
    metadata: {
      source: 'smoke-pre-apk',
    },
  };

  const postResult = await fetchWithTimeout('POST', '/api/condition-alerts', timeoutMs, {
    body: JSON.stringify(postPayload),
  });
  ensureJsonOk(postResult);
  const postItem = (postResult.json?.item ?? null) as JsonObject | null;
  const id = typeof postItem?.id === 'string' ? postItem.id : null;
  ensure(id, 'POST /api/condition-alerts did not return item.id');

  const getResult = await fetchWithTimeout('GET', `/api/condition-alerts?anonUserId=${encodeURIComponent(anonUserId)}`, timeoutMs);
  ensureJsonOk(getResult);

  const patchResult = await fetchWithTimeout('PATCH', '/api/condition-alerts', timeoutMs, {
    body: JSON.stringify({ id, status: 'paused' }),
  });
  ensureJsonOk(patchResult);

  const mode = String(postResult.json?.mode ?? patchResult.json?.mode ?? 'unknown');
  printPass(`condition-alerts CRUD ${mode} ${postResult.durationMs + getResult.durationMs + patchResult.durationMs}ms`);
}

async function main() {
  try {
    await runPage('/', 5000);
    await runPage('/alerts', 5000);
    await runGet('/api/cards/feed', 5000, (result) => {
      const count = Number(result.json?.count ?? (Array.isArray(result.json?.items) ? result.json?.items.length : 0));
      return `count=${count}`;
    });
    await runGet('/api/live-signals', 3000, (result) => `count=${Number(result.json?.count ?? 0)}`);
    await runGet('/api/live-alert-triggers', 3000, (result) => `count=${Number(result.json?.count ?? 0)}`);
    await runGet('/api/cron/live-runtime-sync', 5000, (result) => `mode=${String(result.json?.mode ?? 'unknown')}`);
    await runConditionAlertsCrud(5000);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    printFail(message);
    process.exit(1);
  }
}

main();
