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
    for (const card of cards) {
      const latest = card.asset.dailyPrices[0];
      await prisma.cardPriceSnapshot.create({
        data: {
          cardId: card.id,
          snapshotType: 'latest_daily',
          price: latest?.close,
          source: latest?.source ?? 'fallback',
          basis: latest?.basis ?? '가격 데이터 준비중',
        },
      });
      saved += 1;
    }

    return { calculatedSnapshots: saved, fallback: false };
  });
}
