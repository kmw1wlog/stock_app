import { getDisplayPolicy, type MarketType } from '@/lib/display/displayPolicy';
import type { AssetLabelView } from '@/lib/labels/labelEngine';

export type GeneratedCardType =
  | 'kr_gainer'
  | 'kr_loser'
  | 'kr_volume'
  | 'kr_disclosure'
  | 'kr_news'
  | 'kr_chart_setup'
  | 'us_widget'
  | 'us_sec_event'
  | 'crypto_gainer_24h'
  | 'crypto_volume'
  | 'crypto_chart_setup';

export function generateCardFromLabels(input: {
  market: MarketType;
  symbol: string;
  name: string;
  theme?: string;
  labels: AssetLabelView[];
  changePct?: number;
}) {
  const displayPolicy = getDisplayPolicy(input.market);
  const primary = input.labels[0];
  const hasEvent = input.labels.some((label) => ['news', 'disclosure', 'sec'].includes(label.labelType));
  const cardType: GeneratedCardType =
    input.market === 'CRYPTO'
      ? 'crypto_gainer_24h'
      : input.market === 'US'
        ? hasEvent ? 'us_sec_event' : 'us_widget'
        : hasEvent
          ? 'kr_disclosure'
          : input.changePct !== undefined && input.changePct < 0
            ? 'kr_loser'
            : 'kr_gainer';

  return {
    market: input.market,
    symbol: input.symbol,
    title: input.name,
    subtitle: input.theme,
    cardType,
    primaryReason: primary?.displayText ?? '공식 데이터 기준 후보',
    secondaryReason: primary?.basis ?? displayPolicy.dataBasisLabel,
    fomoText: null,
    dataBasisLabel: displayPolicy.dataBasisLabel,
    priceDisplayMode: displayPolicy.priceDisplayMode,
    chartDisplayMode: displayPolicy.chartDisplayMode,
  };
}
