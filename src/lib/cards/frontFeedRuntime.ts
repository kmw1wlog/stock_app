import { fetchKoreaDailyCandles, fetchKoreaEodQuote, fetchKoreaEtfQuote } from '@/lib/providers/korea/dataGoKr';
import type { DisplayCard } from '@/lib/marketDataTypes';

type KrWatchAsset = {
  symbol: string;
  name: string;
  theme: string;
  marketSegment: 'KOSPI' | 'KOSDAQ';
  tvSymbol: string;
};

const frontFeedAssets: KrWatchAsset[] = [
  { symbol: '005930', name: '삼성전자', theme: '반도체', marketSegment: 'KOSPI', tvSymbol: 'KRX:005930' },
  { symbol: '000660', name: 'SK하이닉스', theme: '반도체', marketSegment: 'KOSPI', tvSymbol: 'KRX:000660' },
  { symbol: '035420', name: 'NAVER', theme: '인터넷', marketSegment: 'KOSPI', tvSymbol: 'KRX:035420' },
  { symbol: '005380', name: '현대차', theme: '자동차', marketSegment: 'KOSPI', tvSymbol: 'KRX:005380' },
  { symbol: '277810', name: '레인보우로보틱스', theme: '로봇', marketSegment: 'KOSDAQ', tvSymbol: 'KRX:277810' },
];

const benchmarkEtfMap = {
  KOSPI: { symbol: '069500', name: 'KOSPI' },
  KOSDAQ: { symbol: '229200', name: 'KOSDAQ' },
} as const;

type FrontRuntimeCache = {
  expiresAt: number;
  cards: DisplayCard[];
};

let cachedFrontFeed: FrontRuntimeCache | null = null;
let inflightFrontFeed: Promise<DisplayCard[]> | null = null;

function safeNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function round(value: number, digits = 1) {
  return Number(value.toFixed(digits));
}

function mean(values: number[]) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatBillionWon(value?: number | null) {
  if (value === null || value === undefined) return null;
  return `${Math.max(1, Math.round(value / 100000000)).toLocaleString('ko-KR')}억`;
}

function formatPctPoint(value?: number | null) {
  if (value === null || value === undefined) return '지수대비 확인중';
  if (Math.abs(value) < 0.05) return '지수대비 보합';
  return `지수대비 ${value > 0 ? '+' : ''}${value.toFixed(1)}%p`;
}

function buildChartSetup(distanceToPrevHighPct?: number | null, changePct?: number | null) {
  if (distanceToPrevHighPct === null || distanceToPrevHighPct === undefined) {
    return (changePct ?? 0) >= 0 ? '고가권 유지' : '시장 흐름 확인';
  }
  if (distanceToPrevHighPct >= 0) return '전고점 재돌파';
  if (distanceToPrevHighPct >= -2) return '전고점 재도전';
  if (distanceToPrevHighPct >= -5) return '고가권 근접';
  return (changePct ?? 0) >= 0 ? '가격 회복 구간' : '시장 흐름 확인';
}

function buildHeadline(asset: KrWatchAsset, input: {
  chartSetup: string;
  amountRatio?: number | null;
  volumeRatio?: number | null;
  changePct?: number | null;
}) {
  const parts = [`${asset.theme} 관심`];
  parts.push(input.chartSetup);
  if ((input.amountRatio ?? 0) >= 1.8) parts.push(`거래대금 ${input.amountRatio!.toFixed(1)}배`);
  else if ((input.volumeRatio ?? 0) >= 1.8) parts.push(`거래량 ${input.volumeRatio!.toFixed(1)}배`);
  else if ((input.changePct ?? 0) >= 2) parts.push('상승 흐름 강화');
  return parts.slice(0, 3).join(' + ');
}

function buildNewsSubline(asset: KrWatchAsset) {
  return `${asset.theme} 흐름과 함께 관련 종목들이 동반 반응 중`;
}

function buildAlertCondition(asset: KrWatchAsset, input: {
  chartSetup: string;
  amountRatio?: number | null;
  benchmarkDeltaPct?: number | null;
}) {
  if ((input.amountRatio ?? 0) >= 2) return '거래대금 급증+전고점 재도전';
  if ((input.benchmarkDeltaPct ?? 0) >= 2) return '지수대비 강세+같은 흐름 알림';
  if (/전고점/.test(input.chartSetup)) return '전고점 시도+수급 유입';
  return `${asset.theme} 관심 흐름 재확인`;
}

function buildLabels(asset: KrWatchAsset, input: {
  amountRatio?: number | null;
  volumeRatio?: number | null;
  benchmarkDeltaPct?: number | null;
}) {
  const labels = [asset.marketSegment, asset.theme];
  if ((input.amountRatio ?? 0) >= 1.8) labels.push(`거래대금 ${input.amountRatio!.toFixed(1)}배`);
  else if ((input.volumeRatio ?? 0) >= 1.8) labels.push(`거래량 ${input.volumeRatio!.toFixed(1)}배`);
  if ((input.benchmarkDeltaPct ?? 0) >= 1.5) labels.push('지수대비 강세');
  return labels.slice(0, 5);
}

async function fetchBenchmarkChangePct() {
  const [kospi, kosdaq] = await Promise.all([
    fetchKoreaEtfQuote(benchmarkEtfMap.KOSPI.symbol),
    fetchKoreaEtfQuote(benchmarkEtfMap.KOSDAQ.symbol),
  ]);

  return {
    KOSPI: safeNumber(kospi.data?.changePct),
    KOSDAQ: safeNumber(kosdaq.data?.changePct),
  };
}

async function buildCard(asset: KrWatchAsset, benchmarkChangePct: number | null): Promise<DisplayCard | null> {
  const [quoteResult, candlesResult] = await Promise.all([
    fetchKoreaEodQuote(asset.symbol),
    fetchKoreaDailyCandles(asset.symbol, 25),
  ]);

  const quote = quoteResult.data;
  if (!quote?.price) return null;

  const candles = candlesResult.data ?? [];
  const latest = candles.at(-1);
  const previous = candles.slice(0, -1).slice(-20);

  const previousHigh = previous.length
    ? Math.max(...previous.map((item) => Math.max(item.high ?? item.close ?? 0, item.close ?? 0)).filter((value) => value > 0))
    : null;
  const previousVolumeMean = mean(previous.map((item) => item.volume ?? 0).filter((value) => value > 0));
  const previousAmountMean = mean(previous.map((item) => item.amount ?? 0).filter((value) => value > 0));

  const volumeRatio = latest?.volume && previousVolumeMean ? latest.volume / previousVolumeMean : null;
  const amountRatio = latest?.amount && previousAmountMean ? latest.amount / previousAmountMean : null;
  const distanceToPrevHighPct = quote.price && previousHigh ? ((quote.price - previousHigh) / previousHigh) * 100 : null;
  const benchmarkDeltaPct =
    typeof quote.changePct === 'number' && benchmarkChangePct !== null
      ? quote.changePct - benchmarkChangePct
      : null;
  const chartSetup = buildChartSetup(distanceToPrevHighPct, quote.changePct);
  const headline = buildHeadline(asset, { chartSetup, amountRatio, volumeRatio, changePct: quote.changePct });
  const newsSubline = buildNewsSubline(asset);
  const alertConditionLabel = buildAlertCondition(asset, { chartSetup, amountRatio, benchmarkDeltaPct });

  return {
    id: `front-runtime-${asset.symbol}`,
    assetKey: asset.symbol,
    symbol: asset.symbol,
    name: asset.name,
    market: 'KR',
    marketLabel: '국장',
    marketSegment: asset.marketSegment,
    theme: asset.theme,
    cardType: quote.changePct !== null && quote.changePct !== undefined && quote.changePct < 0 ? 'kr_loser' : 'kr_gainer',
    title: headline,
    primaryReason: headline,
    secondaryReason: newsSubline,
    headline,
    newsSubline,
    alertConditionLabel,
    price: quote.price,
    changePct: quote.changePct,
    volume: latest?.volume ?? quote.volume ?? null,
    amount: latest?.amount ?? quote.amount ?? null,
    labels: buildLabels(asset, { amountRatio, volumeRatio, benchmarkDeltaPct }),
    dataBasisLabel: '전일 기준 · Data.go.kr + 20일 캔들 계산',
    source: 'front-runtime',
    updatedAt: quoteResult.fetchedAt,
    tvSymbol: asset.tvSymbol,
    chartSetupType: chartSetup,
    technicalSnapshot: {
      benchmarkName: asset.marketSegment,
      benchmarkChangePct,
      marketRelativeStrengthPct: benchmarkDeltaPct !== null ? round(benchmarkDeltaPct, 1) : null,
      previousHighPrice: previousHigh ? Math.round(previousHigh) : null,
      previousHighDistancePct: distanceToPrevHighPct !== null ? round(distanceToPrevHighPct, 1) : null,
      timeAdjustedVolumeRatio: volumeRatio !== null ? round(volumeRatio, 1) : null,
      timeAdjustedAmountRatio: amountRatio !== null ? round(amountRatio, 1) : null,
      benchmarkStrengthLabel: formatPctPoint(benchmarkDeltaPct),
      previousHighLabel: previousHigh ? `전고점 ${Math.round(previousHigh).toLocaleString('ko-KR')}` : '고가권 확인',
      amountLabel: formatBillionWon(latest?.amount ?? quote.amount ?? null),
    },
    isWidget: false,
    isMock: false,
  };
}

export async function buildFrontRuntimeCards(limit = 5): Promise<DisplayCard[]> {
  const benchmarkChanges = await fetchBenchmarkChangePct();
  const cards = await Promise.all(
    frontFeedAssets.slice(0, limit).map((asset) => buildCard(asset, benchmarkChanges[asset.marketSegment])),
  );
  return cards.filter((card): card is DisplayCard => Boolean(card));
}

export async function getCachedFrontRuntimeCards(limit = 5): Promise<DisplayCard[]> {
  if (cachedFrontFeed && cachedFrontFeed.expiresAt > Date.now()) {
    return cachedFrontFeed.cards.slice(0, limit);
  }
  if (!inflightFrontFeed) {
    inflightFrontFeed = buildFrontRuntimeCards(Math.max(limit, 5))
      .then((cards) => {
        cachedFrontFeed = { cards, expiresAt: Date.now() + 10 * 60 * 1000 };
        return cards;
      })
      .finally(() => {
        inflightFrontFeed = null;
      });
  }
  const cards = await inflightFrontFeed;
  return cards.slice(0, limit);
}
