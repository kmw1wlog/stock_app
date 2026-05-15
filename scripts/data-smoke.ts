type SmokeResult = {
  provider: string;
  ok: boolean;
  status?: number;
  endpoint: string;
  summary?: string;
  error?: string;
  rawTextSnippet?: string;
};

async function fetchJson(endpoint: string): Promise<{ ok: boolean; status: number; data: unknown; rawTextSnippet: string }> {
  const response = await fetch(endpoint, { cache: 'no-store' });
  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  return { ok: response.ok, status: response.status, data, rawTextSnippet: text.slice(0, 500) };
}

async function binance(): Promise<SmokeResult> {
  const endpoint = 'https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT';
  try {
    const result = await fetchJson(endpoint);
    const data = result.data as { lastPrice?: string; priceChangePercent?: string; volume?: string } | null;
    return {
      provider: 'binance',
      ok: result.ok && Boolean(data?.lastPrice),
      status: result.status,
      endpoint,
      summary: data?.lastPrice ? `BTCUSDT ${data.lastPrice}, 24h ${data.priceChangePercent}%, volume ${data.volume}` : undefined,
      rawTextSnippet: result.rawTextSnippet,
    };
  } catch (error) {
    return { provider: 'binance', ok: false, endpoint, error: error instanceof Error ? error.message : 'unknown error' };
  }
}

async function upbit(): Promise<SmokeResult> {
  const endpoint = 'https://api.upbit.com/v1/ticker?markets=KRW-BTC';
  try {
    const result = await fetchJson(endpoint);
    const item = Array.isArray(result.data) ? result.data[0] as { trade_price?: number; signed_change_rate?: number; acc_trade_volume_24h?: number } : null;
    return {
      provider: 'upbit',
      ok: result.ok && Boolean(item?.trade_price),
      status: result.status,
      endpoint,
      summary: item?.trade_price ? `KRW-BTC ${item.trade_price}, 24h ${((item.signed_change_rate ?? 0) * 100).toFixed(2)}%, volume ${item.acc_trade_volume_24h}` : undefined,
      rawTextSnippet: result.rawTextSnippet,
    };
  } catch (error) {
    return { provider: 'upbit', ok: false, endpoint, error: error instanceof Error ? error.message : 'unknown error' };
  }
}

async function fearGreed(): Promise<SmokeResult> {
  const endpoint = 'https://api.alternative.me/fng/?limit=1';
  try {
    const result = await fetchJson(endpoint);
    const item = (result.data as { data?: Array<{ value?: string; value_classification?: string }> } | null)?.data?.[0];
    return {
      provider: 'alternative-fng',
      ok: result.ok && Boolean(item?.value),
      status: result.status,
      endpoint,
      summary: item?.value ? `Fear & Greed ${item.value} ${item.value_classification ?? ''}` : undefined,
      rawTextSnippet: result.rawTextSnippet,
    };
  } catch (error) {
    return { provider: 'alternative-fng', ok: false, endpoint, error: error instanceof Error ? error.message : 'unknown error' };
  }
}

async function main() {
  const results = await Promise.all([binance(), upbit(), fearGreed()]);
  console.log(JSON.stringify({ ok: results.some((result) => result.ok), results }, null, 2));

  if (!results.some((result) => result.ok)) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
