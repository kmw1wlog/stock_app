import type { MarketType } from '@/lib/display/displayPolicy';

export type DisplayCard = {
  id: string;
  assetKey: string;
  symbol: string;
  name: string;
  market: MarketType;
  marketLabel: string;
  marketSegment?: 'KOSPI' | 'KOSDAQ' | null;
  theme?: string | null;
  cardType: string;
  title: string;
  primaryReason: string;
  secondaryReason?: string | null;
  headline?: string | null;
  newsSubline?: string | null;
  alertConditionLabel?: string | null;
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
  technicalSnapshot?: Record<string, unknown> | null;
  riskSnapshot?: Record<string, unknown> | null;
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
