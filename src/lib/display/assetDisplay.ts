import type { MarketType } from './displayPolicy';
import { getDisplayPolicy } from './displayPolicy';

export type AssetDisplayInput = {
  market: MarketType;
  symbol: string;
  name: string;
  tvSymbol?: string;
  coingeckoId?: string;
  cmcId?: string;
};

export function getAssetDisplay(asset: AssetDisplayInput) {
  const policy = getDisplayPolicy(asset.market);
  return {
    ...asset,
    displayPolicy: policy,
    dataBasisLabel: policy.dataBasisLabel,
  };
}
