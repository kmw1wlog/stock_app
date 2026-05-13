'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type { Candle } from '@/lib/chart/candleService';
import type { MarketType } from '@/lib/display/displayPolicy';
import { getDisplayPolicy } from '@/lib/display/displayPolicy';
import { SparklineChart } from './SparklineChart';

const NativePriceChart = dynamic(() => import('./NativePriceChart').then((mod) => mod.NativePriceChart), { ssr: false });
const TradingViewChartWidget = dynamic(() => import('@/components/widgets/TradingViewChartWidget').then((mod) => mod.TradingViewChartWidget), { ssr: false });
const CoinGeckoPriceWidget = dynamic(() => import('@/components/widgets/CoinGeckoPriceWidget').then((mod) => mod.CoinGeckoPriceWidget), { ssr: false });

export function AssetChart({
  market,
  assetKey,
  tvSymbol,
  coingeckoId,
  compact,
}: {
  market: MarketType;
  assetKey?: string;
  tvSymbol?: string;
  coingeckoId?: string;
  compact?: boolean;
}) {
  const policy = getDisplayPolicy(market);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (market !== 'KR' || compact || !assetKey) {
      return;
    }
    fetch(`/api/assets/${assetKey}/candles?interval=1d`)
      .then((response) => response.json())
      .then((data: { candles?: Candle[]; fallback?: boolean }) => {
        setCandles(data.candles ?? []);
        setFallback(Boolean(data.fallback));
      })
      .catch(() => setFallback(true));
  }, [assetKey, compact, market]);

  if (compact) {
    return <SparklineChart tone={market === 'CRYPTO' ? 'orange' : market === 'US' ? 'green' : 'blue'} />;
  }
  if (policy.chartDisplayMode === 'native_lightweight') {
    return candles.length ? <NativePriceChart candles={candles} fallback={fallback} /> : <SparklineChart tone="blue" />;
  }
  if (market === 'CRYPTO' && coingeckoId) {
    return <CoinGeckoPriceWidget coinId={coingeckoId} />;
  }
  if (policy.chartDisplayMode === 'tradingview_widget' && tvSymbol) {
    return <TradingViewChartWidget symbol={tvSymbol} advanced />;
  }
  return <SparklineChart tone={market === 'CRYPTO' ? 'orange' : 'blue'} />;
}
