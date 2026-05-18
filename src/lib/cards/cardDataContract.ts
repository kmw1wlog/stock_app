export type FeedCardFactTone = 'positive' | 'neutral' | 'warning';

export type FeedCardFact = {
  label: string;
  value?: string;
  tone?: FeedCardFactTone;
};

export type FeedCardChartPoint = {
  time: string;
  price: number;
};

export type FeedCardAlertEngine = {
  code: string;
  key: string;
  name: string;
  description: string;
  easyRule: string;
  applicable: boolean;
  recommended: boolean;
};

export type FeedCardNewsItem = {
  title: string;
  source: string;
  publishedAt?: string;
  url?: string;
  summary?: string;
  isFallback?: boolean;
};

export type FeedCardDisclosureItem = {
  title: string;
  source: 'OpenDART';
  publishedAt?: string;
  url?: string;
  summary?: string;
  isFallback?: boolean;
};

export type FeedCardDiagnosisMetric = {
  label: string;
  value: string;
  description: string;
  tone: 'good' | 'neutral' | 'caution';
};

export type FeedCardData = {
  id: string;
  symbol: string;
  name: string;
  market: 'KOSPI' | 'KOSDAQ';
  themeLabels: string[];
  price?: number;
  changePct?: number;
  tradingValueLabel?: string;
  volumeRatioLabel?: string;
  headline: string;
  newsSubline: string;
  facts: [FeedCardFact, FeedCardFact, FeedCardFact];
  chart: {
    source: 'runtime' | 'db' | 'sample';
    points: FeedCardChartPoint[];
  };
  alert: {
    formulaKey: string;
    formulaName: string;
    displayCondition: string;
    engines: FeedCardAlertEngine[];
  };
  news: FeedCardNewsItem[];
  disclosures: FeedCardDisclosureItem[];
  diagnosis: FeedCardDiagnosisMetric[];
};

export type CardDetailData = {
  symbol: string;
  name: string;
  market: string;
  theme?: string | null;
  providers: {
    news: 'db' | 'api' | 'fallback';
    disclosures: 'db' | 'api' | 'fallback';
  };
  news: FeedCardNewsItem[];
  disclosures: FeedCardDisclosureItem[];
  alert: {
    recommendedKey: string;
    recommendedName: string;
    displayCondition: string;
    engines: FeedCardAlertEngine[];
  };
};
