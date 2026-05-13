import { runCronJob } from '@/lib/cron/cronRoute';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';

const eventMap = {
  card_impression: 'impressions',
  card_save: 'saves',
  card_like: 'likes',
  card_skip: 'skips',
  card_detail_view: 'detailViews',
  formula_view: 'formulaViews',
  formula_copy: 'formulaCopies',
  comment_view: 'commentViews',
  premium_lock_click: 'premiumClicks',
} as const;

export async function GET(request: Request) {
  return runCronJob(request, 'rollups', async () => {
    if (!hasDatabaseUrl()) {
      return { rollups: 0, fallback: true };
    }

    const since = new Date(Date.now() - 24 * 60 * 60_000);
    const events = await prisma.userEvent.findMany({
      where: { createdAt: { gte: since }, cardKey: { not: null } },
      select: { cardKey: true, eventType: true },
    });

    const grouped = new Map<string, Record<string, number>>();
    for (const event of events) {
      if (!event.cardKey) {
        continue;
      }
      const metric = eventMap[event.eventType as keyof typeof eventMap];
      if (!metric) {
        continue;
      }
      const current = grouped.get(event.cardKey) ?? {};
      current[metric] = (current[metric] ?? 0) + 1;
      grouped.set(event.cardKey, current);
    }

    let saved = 0;
    for (const [cardKey, metrics] of grouped) {
      await prisma.cardMetricRollup.upsert({
        where: { cardId_period: { cardId: cardKey, period: '24h' } },
        create: {
          cardId: cardKey,
          period: '24h',
          impressions: metrics.impressions ?? 0,
          saves: metrics.saves ?? 0,
          likes: metrics.likes ?? 0,
          skips: metrics.skips ?? 0,
          detailViews: metrics.detailViews ?? 0,
          formulaViews: metrics.formulaViews ?? 0,
          formulaCopies: metrics.formulaCopies ?? 0,
          commentViews: metrics.commentViews ?? 0,
          premiumClicks: metrics.premiumClicks ?? 0,
        },
        update: {
          impressions: metrics.impressions ?? 0,
          saves: metrics.saves ?? 0,
          likes: metrics.likes ?? 0,
          skips: metrics.skips ?? 0,
          detailViews: metrics.detailViews ?? 0,
          formulaViews: metrics.formulaViews ?? 0,
          formulaCopies: metrics.formulaCopies ?? 0,
          commentViews: metrics.commentViews ?? 0,
          premiumClicks: metrics.premiumClicks ?? 0,
        },
      });
      saved += 1;
    }

    return { rollups: saved, fallback: false };
  });
}
