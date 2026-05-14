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
  | 'login_connect_success'
  | 'condition_alert_button_view'
  | 'condition_alert_open_modal'
  | 'condition_alert_create'
  | 'condition_alert_cancel'
  | 'condition_alert_expire'
  | 'condition_alert_extend'
  | 'condition_alert_trigger'
  | 'condition_alert_notification_open'
  | 'mts_cta_impression'
  | 'mts_cta_click'
  | 'mts_selector_open'
  | 'mts_provider_select'
  | 'mts_deeplink_attempt'
  | 'mts_store_redirect'
  | 'mts_preference_set'
  | 'sponsored_mts_impression'
  | 'sponsored_mts_click'
  | 'ad_slot_impression'
  | 'ad_slot_click'
  | 'native_ad_impression'
  | 'native_ad_click'
  | 'content_ad_impression'
  | 'content_ad_click'
  | 'rewarded_ad_start'
  | 'rewarded_ad_complete'
  | 'home_alert_click'
  | 'home_formula_click'
  | 'home_detail_click'
  | 'formula_copy_text'
  | 'external_research_click'
  | 'influencer_link_click';

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
