'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type { Candle } from '@/lib/chart/candleService';
import type { MarketType } from '@/lib/display/displayPolicy';
import { getDisplayPolicy } from '@/lib/display/displayPolicy';

const NativePriceChart = dynamic(() => import('./NativePriceChart').then((mod) => mod.NativePriceChart), { ssr: false });
const TradingViewAdvancedChartWidget = dynamic(() => import('@/components/widgets/TradingViewChartWidget').then((mod) => mod.TradingViewAdvancedChartWidget), { ssr: false });
const TradingViewMiniSymbolWidget = dynamic(() => import('@/components/widgets/TradingViewChartWidget').then((mod) => mod.TradingViewMiniSymbolWidget), { ssr: false });
const CoinGeckoPriceWidget = dynamic(() => import('@/components/widgets/CoinGeckoPriceWidget').then((mod) => mod.CoinGeckoPriceWidget), { ssr: false });

export function AssetChart({ market, assetKey, tvSymbol, coingeckoId, compact }: { market: MarketType; assetKey?: string; tvSymbol?: string; coingeckoId?: string; compact?: boolean }) {
  const policy = getDisplayPolicy(market);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [message, setMessage] = useState('차트 데이터 준비중');

  useEffect(() => {
    if ((market !== 'KR' && market !== 'CRYPTO') || compact || !assetKey) return;
    fetch(`/api/assets/${assetKey}/candles?interval=1d`)
      .then((response) => response.json())
      .then((data: { candles?: Candle[]; message?: string }) => {
        setCandles(data.candles ?? []);
        setMessage(data.message ?? '차트 데이터 준비중');
      })
      .catch(() => setMessage('차트 데이터 준비중'));
  }, [assetKey, compact, market]);

  if (compact) {
    if (market === 'US' && tvSymbol) return <TradingViewMiniSymbolWidget symbol={tvSymbol} />;
    return <div className="grid min-h-[120px] place-items-center rounded-2xl bg-slate-50 text-xs font-bold text-slate-500">차트 데이터 준비중</div>;
  }
  if (market === 'US' && tvSymbol) return <TradingViewAdvancedChartWidget symbol={tvSymbol} />;
  if (market === 'CRYPTO' && coingeckoId && process.env.NEXT_PUBLIC_ENABLE_COINGECKO_WIDGETS === 'true') return <CoinGeckoPriceWidget coinId={coingeckoId} />;
  if (policy.chartDisplayMode === 'native_lightweight' || market === 'CRYPTO') {
    return candles.length ? <NativePriceChart candles={candles} /> : <div className="grid min-h-[220px] place-items-center rounded-3xl border border-slate-200 bg-white text-sm font-bold text-slate-500">{message}</div>;
  }
  return <div className="grid min-h-[220px] place-items-center rounded-3xl border border-slate-200 bg-white text-sm font-bold text-slate-500">차트 데이터 준비중</div>;
}
