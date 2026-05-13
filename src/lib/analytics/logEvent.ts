import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import type { Prisma } from '@prisma/client';

export type EventType =
  | 'card_impression'
  | 'card_skip'
  | 'card_like'
  | 'card_save'
  | 'card_detail_view'
  | 'formula_view'
  | 'formula_copy'
  | 'comment_view'
  | 'reaction_zone_click'
  | 'missed_card_click'
  | 'premium_lock_view'
  | 'premium_lock_click'
  | 'widget_view'
  | 'market_filter_change';

export async function logServerEvent(input: {
  anonUserId: string;
  eventType: EventType | string;
  cardId?: string;
  assetId?: string;
  market?: string;
  metadata?: Record<string, unknown>;
}) {
  if (!hasDatabaseUrl()) {
    console.log('[event:fallback]', input.eventType, input.metadata);
    return { ok: true, fallback: true };
  }
  await prisma.userEvent.create({
    data: {
      anonUserId: input.anonUserId,
      eventType: input.eventType,
      cardId: input.cardId,
      assetId: input.assetId,
      market: input.market,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
  });
  return { ok: true, fallback: false };
}
