export type MarketType = 'KR' | 'US' | 'CRYPTO';

export type PriceDisplayMode = 'internal_eod' | 'widget' | 'internal_public' | 'label_only' | 'disabled';
export type ChartDisplayMode = 'native_lightweight' | 'tradingview_widget' | 'coingecko_widget' | 'cmc_widget' | 'sparkline_label' | 'disabled';

export type DisplayPolicy = {
  market: MarketType;
  priceDisplayMode: PriceDisplayMode;
  chartDisplayMode: ChartDisplayMode;
  canComputeDirectReturn: boolean;
  dataBasisLabel: string;
};

export function getDisplayPolicy(market: MarketType): DisplayPolicy {
  if (market === 'KR') {
    return {
      market,
      priceDisplayMode: 'internal_eod',
      chartDisplayMode: 'native_lightweight',
      canComputeDirectReturn: true,
      dataBasisLabel: '전일 기준 · 공공데이터',
    };
  }

  if (market === 'US') {
    const directProvider = process.env.US_DIRECT_PRICE_PROVIDER;
    const canComputeDirectReturn = directProvider === 'alpaca' || directProvider === 'polygon' || directProvider === 'twelveData';
    return {
      market,
      priceDisplayMode: canComputeDirectReturn ? 'internal_public' : 'widget',
      chartDisplayMode: 'tradingview_widget',
      canComputeDirectReturn,
      dataBasisLabel: canComputeDirectReturn ? `직접 가격 API + TradingView 위젯 · ${directProvider}` : 'TradingView 위젯 기준 · 직접 가격 API 없음',
    };
  }

  return {
    market,
    priceDisplayMode: 'internal_public',
    chartDisplayMode: process.env.NEXT_PUBLIC_ENABLE_COINGECKO_WIDGETS === 'true' ? 'coingecko_widget' : 'native_lightweight',
    canComputeDirectReturn: true,
    dataBasisLabel: '24h 기준 · Binance/Upbit public API',
  };
}
