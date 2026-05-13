import { runCronJob } from '@/lib/cron/cronRoute';
import { generateCardFromLabels } from '@/lib/cards/cardGenerator';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { buildKoreaLabels } from '@/lib/labels/koreaLabels';
import { ensureAsset } from '@/lib/providers/pipeline';

export async function GET(request: Request) {
  return runCronJob(request, 'generate-cards', async () => {
    const labels = buildKoreaLabels({ market: 'KR', newsCount: 3, communityScore: 70, volumeRatio: 2 });
    const generated = generateCardFromLabels({
      market: 'KR',
      symbol: '277810',
      name: '레인보우로보틱스',
      theme: '로봇',
      labels,
      returnToHighPct: 6.8,
    });
    const asset = await ensureAsset({ market: 'KR', symbol: '277810', name: '레인보우로보틱스', theme: '로봇', tvSymbol: 'KRX:277810' });

    if (!hasDatabaseUrl() || asset.fallback) {
      return { generated: 1, saved: false, fallback: true, cardType: generated.cardType, dataBasisLabel: generated.dataBasisLabel };
    }

    const card = await prisma.recommendationCard.upsert({
      where: { id: 'kr-277810-chart-setup' },
      create: {
        id: 'kr-277810-chart-setup',
        assetId: asset.id,
        market: generated.market,
        cardType: generated.cardType,
        title: generated.title,
        subtitle: generated.subtitle,
        primaryReason: generated.primaryReason,
        secondaryReason: generated.secondaryReason,
        fomoText: generated.fomoText,
        dataBasisLabel: generated.dataBasisLabel,
        priceDisplayMode: generated.priceDisplayMode,
        chartDisplayMode: generated.chartDisplayMode,
      },
      update: {
        cardType: generated.cardType,
        title: generated.title,
        subtitle: generated.subtitle,
        primaryReason: generated.primaryReason,
        secondaryReason: generated.secondaryReason,
        fomoText: generated.fomoText,
        dataBasisLabel: generated.dataBasisLabel,
        priceDisplayMode: generated.priceDisplayMode,
        chartDisplayMode: generated.chartDisplayMode,
        status: 'active',
      },
    });

    return { generated: 1, saved: true, cardId: card.id, cardType: card.cardType, dataBasisLabel: card.dataBasisLabel };
  });
}
