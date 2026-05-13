import { getDisplayPolicy, type MarketType } from '@/lib/display/displayPolicy';
import { generateFomoText } from './fomoTextGenerator';
import { generateReactionZone } from './reactionZoneGenerator';
import type { AssetLabelView } from '@/lib/labels/labelEngine';

export type GeneratedCardType =
  | 'stock_recommendation'
  | 'theme_hot'
  | 'gainer'
  | 'upper_limit'
  | 'loser'
  | 'after_hours'
  | 'reaction_zone'
  | 'copy_popular_formula'
  | 'news_momentum'
  | 'community_attention'
  | 'missed_opportunity'
  | 'crypto_leverage'
  | 'us_earnings_event';

export function generateCardFromLabels(input: {
  market: MarketType;
  symbol: string;
  name: string;
  theme?: string;
  labels: AssetLabelView[];
  returnToHighPct?: number;
}) {
  const displayPolicy = getDisplayPolicy(input.market);
  const reactionZone = generateReactionZone(input.labels);
  const cardType: GeneratedCardType =
    input.market === 'CRYPTO'
      ? 'crypto_leverage'
      : input.market === 'US'
        ? 'us_earnings_event'
        : input.returnToHighPct
          ? 'missed_opportunity'
          : 'reaction_zone';

  return {
    market: input.market,
    symbol: input.symbol,
    title: input.name,
    subtitle: input.theme,
    cardType,
    primaryReason: reactionZone.title,
    secondaryReason: reactionZone.description,
    fomoText: generateFomoText({
      market: input.market,
      cardType,
      returnToHighPct: input.returnToHighPct,
      displayPolicy,
      basis: displayPolicy.dataBasisLabel,
    }),
    dataBasisLabel: displayPolicy.dataBasisLabel,
    priceDisplayMode: displayPolicy.priceDisplayMode,
    chartDisplayMode: displayPolicy.chartDisplayMode,
  };
}
