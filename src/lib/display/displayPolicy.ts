export type MarketType = 'KR' | 'US' | 'CRYPTO';

export type PriceDisplayMode = 'internal_eod' | 'widget' | 'internal_public' | 'label_only' | 'disabled';

export type ChartDisplayMode =
  | 'native_lightweight'
  | 'tradingview_widget'
  | 'coingecko_widget'
  | 'cmc_widget'
  | 'sparkline_label'
  | 'disabled';

export type DisplayPolicy = {
  market: MarketType;
  priceDisplayMode: PriceDisplayMode;
  chartDisplayMode: ChartDisplayMode;
  canComputeFomoReturn: boolean;
  dataBasisLabel: string;
};

export function getDisplayPolicy(market: MarketType): DisplayPolicy {
  if (market === 'KR') {
    return {
      market,
      priceDisplayMode: 'internal_eod',
      chartDisplayMode: 'native_lightweight',
      canComputeFomoReturn: true,
      dataBasisLabel: '전일 기준 · 공공데이터',
    };
  }

  if (market === 'US') {
    const directProvider = process.env.US_DIRECT_PRICE_PROVIDER;
    const canComputeFomoReturn = directProvider === 'alpaca' || directProvider === 'polygon' || directProvider === 'twelveData';
    return {
      market,
      priceDisplayMode: 'widget',
      chartDisplayMode: 'tradingview_widget',
      canComputeFomoReturn,
      dataBasisLabel: canComputeFomoReturn ? `직접 API + 위젯 제공 · ${directProvider}` : '위젯 제공 · 지연 가능',
    };
  }

  return {
    market,
    priceDisplayMode: process.env.NEXT_PUBLIC_ENABLE_COINGECKO_WIDGETS === 'true' ? 'widget' : 'internal_public',
    chartDisplayMode: process.env.NEXT_PUBLIC_ENABLE_COINGECKO_WIDGETS === 'true' ? 'coingecko_widget' : 'tradingview_widget',
    canComputeFomoReturn: true,
    dataBasisLabel: '24h 기준 · 공개 API/위젯',
  };
}
