import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { startJob, finishJob, type JobResult } from '@/lib/jobs/types';

function cardTypeFor(market: string, changePct?: number | null, hasEvent?: boolean) {
  if (market === 'CRYPTO') return 'crypto_gainer_24h';
  if (market === 'US') return hasEvent ? 'us_sec_event' : 'us_widget';
  if (hasEvent) return 'kr_disclosure';
  if (changePct !== undefined && changePct !== null && changePct < 0) return 'kr_loser';
  return 'kr_gainer';
}

export async function generateCardsJob(): Promise<JobResult> {
  const startedAt = startJob();
  if (!hasDatabaseUrl()) return finishJob({ jobName: 'generate-cards', ok: false, provider: 'db', startedAt, fetched: 0, normalized: 0, saved: 0, skipped: 0, failed: 1, missingEnv: ['DATABASE_URL'], errors: [{ message: 'DATABASE_URL missing' }] });

  const assets = await prisma.asset.findMany({
    where: { isActive: true },
    include: {
      dailyPrices: { orderBy: { date: 'desc' }, take: 1 },
      intradayPrices: { orderBy: { time: 'desc' }, take: 1 },
      labels: { orderBy: { updatedAt: 'desc' }, take: 5 },
    },
    take: 500,
  });

  let saved = 0;
  let skipped = 0;
  for (const asset of assets) {
    const daily = asset.dailyPrices[0];
    const intraday = asset.intradayPrices[0];
    const hasDisplayData = Boolean(daily?.close || intraday?.close || (asset.market === 'US' && asset.tvSymbol));
    if (!hasDisplayData) {
      skipped += 1;
      continue;
    }
    const hasEvent = asset.labels.some((label) => ['disclosure', 'sec', 'news'].includes(label.labelType));
    const cardType = cardTypeFor(asset.market, daily?.changePct, hasEvent);
    const basis = asset.market === 'US'
      ? daily?.basis ?? 'TradingView 위젯 기준 · SEC EDGAR metadata'
      : intraday?.source
        ? `${intraday.interval} 기준 · ${intraday.source}`
        : daily?.basis ?? '공식 데이터 기준';
    const id = `${asset.market.toLowerCase()}-${asset.symbol.toLowerCase()}-${cardType}`;
    const title = asset.market === 'US' ? `${asset.name} 공식 위젯/SEC 데이터` : `${asset.name} 공식 데이터 기준`;
    const primaryReason = asset.labels[0]?.displayText ?? (daily?.changePct === undefined || daily?.changePct === null ? '공식 데이터가 저장된 종목입니다.' : `전일 대비 ${daily.changePct >= 0 ? '상승' : '하락'}`);

    await prisma.recommendationCard.upsert({
      where: { id },
      create: {
        id,
        assetId: asset.id,
        market: asset.market,
        cardType,
        title,
        subtitle: asset.theme ?? undefined,
        primaryReason,
        secondaryReason: asset.labels[1]?.displayText,
        fomoText: null,
        dataBasisLabel: basis,
        priceDisplayMode: asset.market === 'US' && !daily?.close ? 'widget' : 'native',
        chartDisplayMode: asset.market === 'US' ? 'tradingview_widget' : 'native_lightweight',
        isPremium: false,
      },
      update: {
        cardType,
        title,
        subtitle: asset.theme ?? undefined,
        primaryReason,
        secondaryReason: asset.labels[1]?.displayText,
        fomoText: null,
        dataBasisLabel: basis,
        priceDisplayMode: asset.market === 'US' && !daily?.close ? 'widget' : 'native',
        chartDisplayMode: asset.market === 'US' ? 'tradingview_widget' : 'native_lightweight',
        isPremium: false,
        status: 'active',
      },
    });
    saved += 1;
  }

  return finishJob({ jobName: 'generate-cards', ok: true, provider: 'db', startedAt, fetched: assets.length, normalized: assets.length - skipped, saved, skipped, failed: 0, missingEnv: [], errors: [] });
}
