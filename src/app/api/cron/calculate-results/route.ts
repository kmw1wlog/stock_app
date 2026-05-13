import { runCronJob } from '@/lib/cron/cronRoute';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';

export async function GET(request: Request) {
  return runCronJob(request, 'calculate-results', async () => {
    if (!hasDatabaseUrl()) {
      return { calculatedSnapshots: 0, fallback: true };
    }

    const cards = await prisma.recommendationCard.findMany({
      where: { status: 'active' },
      include: {
        asset: {
          include: {
            dailyPrices: { orderBy: { date: 'desc' }, take: 1 },
          },
        },
      },
      take: 50,
    });

    let saved = 0;
    let skipped = 0;
    for (const card of cards) {
      const latest = card.asset.dailyPrices[0];
      if (!latest) {
        skipped += 1;
        continue;
      }
      await prisma.cardPriceSnapshot.create({
        data: {
          cardId: card.id,
          snapshotType: 'latest_daily',
          price: latest.close,
          source: latest.source,
          basis: latest.basis,
        },
      });
      saved += 1;
    }

    return { calculatedSnapshots: saved, skippedWithoutPrice: skipped, fallback: false };
  });
}
