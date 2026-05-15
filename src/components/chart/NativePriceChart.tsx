'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, type IChartApi } from 'lightweight-charts';
import type { Candle } from '@/lib/chart/candleService';

export function NativePriceChart({ candles, compact }: { candles: Candle[]; markers?: Array<{ time: string; text: string }>; compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !candles.length) return;
    const chart: IChartApi = createChart(ref.current, {
      height: compact ? 150 : 220,
      layout: { background: { type: ColorType.Solid, color: '#ffffff' }, textColor: '#64748B' },
      grid: { vertLines: { color: '#EFF6FF' }, horzLines: { color: '#EFF6FF' } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
    });
    const series = chart.addSeries(CandlestickSeries, { upColor: '#0B63F6', downColor: '#EF4444', borderVisible: false, wickUpColor: '#0B63F6', wickDownColor: '#EF4444' });
    series.setData(candles);
    chart.timeScale().fitContent();
    const handleResize = () => {
      if (ref.current) chart.applyOptions({ width: ref.current.clientWidth });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [candles, compact]);

  return (
    <div className="relative min-h-[220px] overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div ref={ref} className="min-h-[220px]" />
    </div>
  );
}
