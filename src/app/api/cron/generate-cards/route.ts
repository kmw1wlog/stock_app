import { runCronJob } from '@/lib/cron/cronRoute';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';

function cardTypeFor(market: string, changePct?: number | null, hasEvent?: boolean) {
  if (market === 'CRYPTO') return 'crypto_gainer_24h';
  if (market === 'US') return hasEvent ? 'us_sec_event' : 'us_widget';
  if (hasEvent) return 'kr_disclosure';
  if (changePct !== undefined && changePct !== null && changePct < 0) return 'kr_loser';
  return 'kr_gainer';
}

export async function GET(request: Request) {
  return runCronJob(request, 'generate-cards', async () => {
    if (!hasDatabaseUrl()) return { generated: 0, skipped: 'DATABASE_URL missing' };
    const assets = await prisma.asset.findMany({
      where: { isActive: true },
      include: {
        dailyPrices: { orderBy: { date: 'desc' }, take: 1 },
        intradayPrices: { orderBy: { time: 'desc' }, take: 1 },
        labels: { orderBy: { updatedAt: 'desc' }, take: 5 },
      },
      take: 500,
    });

    let generated = 0;
    for (const asset of assets) {
      const daily = asset.dailyPrices[0];
      const intraday = asset.intradayPrices[0];
      const hasDisplayData = Boolean(daily?.close || intraday?.close || (asset.market === 'US' && asset.tvSymbol));
      if (!hasDisplayData) continue;
      const hasEvent = asset.labels.some((label) => ['disclosure', 'sec', 'news'].includes(label.labelType));
      const cardType = cardTypeFor(asset.market, daily?.changePct, hasEvent);
      const basis = asset.market === 'US'
        ? 'TradingView 위젯 기준 · SEC EDGAR metadata'
        : intraday?.source
          ? `${intraday.interval} 기준 · ${intraday.source}`
          : daily?.basis ?? '공식 데이터 기준';
      const id = `${asset.market.toLowerCase()}-${asset.symbol.toLowerCase()}-${cardType}`;

      await prisma.recommendationCard.upsert({
        where: { id },
        create: {
          id,
          assetId: asset.id,
          market: asset.market,
          cardType,
          title: asset.market === 'US' ? `${asset.name} 공식 위젯/SEC 데이터` : `${asset.name} 공식 데이터 기준`,
          subtitle: asset.theme ?? undefined,
          primaryReason: asset.labels[0]?.displayText ?? (daily?.changePct === undefined || daily?.changePct === null ? '공식 데이터가 저장된 종목입니다.' : `전일 대비 ${daily.changePct >= 0 ? '상승' : '하락'}`),
          secondaryReason: asset.labels[1]?.displayText,
          fomoText: null,
          dataBasisLabel: basis,
          priceDisplayMode: asset.market === 'US' ? 'widget' : 'native',
          chartDisplayMode: asset.market === 'US' ? 'tradingview_widget' : 'native_lightweight',
          isPremium: false,
        },
        update: {
          cardType,
          title: asset.market === 'US' ? `${asset.name} 공식 위젯/SEC 데이터` : `${asset.name} 공식 데이터 기준`,
          subtitle: asset.theme ?? undefined,
          primaryReason: asset.labels[0]?.displayText ?? (daily?.changePct === undefined || daily?.changePct === null ? '공식 데이터가 저장된 종목입니다.' : `전일 대비 ${daily.changePct >= 0 ? '상승' : '하락'}`),
          secondaryReason: asset.labels[1]?.displayText,
          fomoText: null,
          dataBasisLabel: basis,
          priceDisplayMode: asset.market === 'US' ? 'widget' : 'native',
          chartDisplayMode: asset.market === 'US' ? 'tradingview_widget' : 'native_lightweight',
          isPremium: false,
          status: 'active',
        },
      });
      generated += 1;
    }

    return { generated };
  });
}
