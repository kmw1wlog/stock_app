import type { MarketType } from '@/lib/display/displayPolicy';

export type DisplayCard = {
  id: string;
  assetKey: string;
  symbol: string;
  name: string;
  market: MarketType;
  marketLabel: string;
  theme?: string | null;
  cardType: string;
  title: string;
  primaryReason: string;
  secondaryReason?: string | null;
  price?: number | null;
  changePct?: number | null;
  volume?: number | null;
  amount?: number | null;
  labels: string[];
  dataBasisLabel: string;
  source: string;
  updatedAt?: string | null;
  tvSymbol?: string | null;
  coingeckoId?: string | null;
  binanceSymbol?: string | null;
  upbitMarket?: string | null;
  chartSetupType?: string | null;
  technicalSnapshot?: {
    volumeRatio20?: number;
    amountRankPct?: number;
    distanceToPrevHighPct?: number;
    breakoutLookbackDays?: number;
    closeToHighPct?: number;
    intradayRangePct?: number;
    volatilityRank20?: number;
    ma5Slope?: number;
    ma20Slope?: number;
    pullbackDays?: number;
  };
  themeSnapshot?: {
    themeBreadthUpCount?: number;
    themeAvgChangePct?: number;
    themeLeaderSymbol?: string;
    isThemeLeader?: boolean;
  };
  riskSnapshot?: {
    isInvestmentWarning?: boolean;
    isLowLiquidity?: boolean;
    upperWickPct?: number;
    gapPct?: number;
    overheatScore?: number;
  };
  isWidget?: boolean;
  isMock?: boolean;
};

export type DataEnvelope<T> = {
  ok: true;
  mode: 'live' | 'mock';
  source: string;
  basis: string;
  updatedAt: string;
  items: T[];
  message?: string;
  missing?: string[];
  fallback?: boolean;
};
