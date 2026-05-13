import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import type { Prisma } from '@prisma/client';

export type EventType =
  | 'card_impression'
  | 'card_skip'
  | 'card_like'
  | 'card_hide'
  | 'card_save'
  | 'card_detail_view'
  | 'chart_seat_click'
  | 'chart_seat_formula_view'
  | 'chart_seat_related_cards_click'
  | 'formula_view'
  | 'formula_copy'
  | 'comment_view'
  | 'market_filter_change'
  | 'theme_filter_change'
  | 'explore_section_open'
  | 'explore_more_click'
  | 'missed_card_click'
  | 'result_track_add'
  | 'result_view'
  | 'premium_lock_view'
  | 'premium_lock_click'
  | 'widget_view'
  | 'login_prompt_view'
  | 'login_connect_success';

export async function logServerEvent(input: {
  anonUserId: string;
  eventType: EventType | string;
  cardKey?: string;
  cardId?: string;
  recommendationCardId?: string;
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
      cardKey: input.cardKey ?? input.cardId,
      recommendationCardId: input.recommendationCardId,
      assetId: input.assetId,
      market: input.market,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
  });
  return { ok: true, fallback: false };
}
