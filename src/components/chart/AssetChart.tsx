import dynamic from 'next/dynamic';
import type { MarketType } from '@/lib/display/displayPolicy';
import { getDisplayPolicy } from '@/lib/display/displayPolicy';
import { SparklineChart } from './SparklineChart';

const NativePriceChart = dynamic(() => import('./NativePriceChart').then((mod) => mod.NativePriceChart), { ssr: false });
const TradingViewChartWidget = dynamic(() => import('@/components/widgets/TradingViewChartWidget').then((mod) => mod.TradingViewChartWidget), { ssr: false });
const CoinGeckoPriceWidget = dynamic(() => import('@/components/widgets/CoinGeckoPriceWidget').then((mod) => mod.CoinGeckoPriceWidget), { ssr: false });

export function AssetChart({
  market,
  tvSymbol,
  coingeckoId,
  compact,
}: {
  market: MarketType;
  tvSymbol?: string;
  coingeckoId?: string;
  compact?: boolean;
}) {
  const policy = getDisplayPolicy(market);
  if (compact) {
    return <SparklineChart tone={market === 'CRYPTO' ? 'orange' : market === 'US' ? 'green' : 'blue'} />;
  }
  if (policy.chartDisplayMode === 'native_lightweight') {
    return <NativePriceChart />;
  }
  if (policy.chartDisplayMode === 'tradingview_widget' && tvSymbol) {
    return <TradingViewChartWidget symbol={tvSymbol} />;
  }
  if (policy.chartDisplayMode === 'coingecko_widget' && coingeckoId) {
    return <CoinGeckoPriceWidget coinId={coingeckoId} />;
  }
  return <SparklineChart tone={market === 'CRYPTO' ? 'orange' : 'blue'} />;
}
