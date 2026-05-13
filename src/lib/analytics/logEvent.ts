import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import type { Prisma } from '@prisma/client';

export type EventType =
  | 'home_view'
  | 'home_variant_assigned'
  | 'hero_card_impression'
  | 'card_impression'
  | 'card_swipe_left'
  | 'card_swipe_right'
  | 'card_swipe_cancel'
  | 'card_tap_detail'
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
  | 'home_section_impression'
  | 'home_section_click'
  | 'explore_tab_click'
  | 'ranking_tab_view'
  | 'ranking_category_click'
  | 'ranking_card_click'
  | 'saved_tab_view'
  | 'report_view'
  | 'result_track_add'
  | 'result_view'
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
