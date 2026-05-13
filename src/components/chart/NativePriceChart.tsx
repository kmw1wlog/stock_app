'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, type IChartApi } from 'lightweight-charts';

const fallbackCandles = [
  { time: '2026-05-01', open: 100, high: 108, low: 96, close: 104 },
  { time: '2026-05-02', open: 104, high: 112, low: 101, close: 110 },
  { time: '2026-05-03', open: 109, high: 118, low: 106, close: 114 },
  { time: '2026-05-07', open: 114, high: 121, low: 111, close: 119 },
  { time: '2026-05-08', open: 118, high: 132, low: 116, close: 129 },
  { time: '2026-05-11', open: 130, high: 144, low: 126, close: 141 },
  { time: '2026-05-12', open: 140, high: 151, low: 137, close: 148 },
];

export function NativePriceChart() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    const chart: IChartApi = createChart(ref.current, {
      height: 220,
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#64748B',
      },
      grid: {
        vertLines: { color: '#EFF6FF' },
        horzLines: { color: '#EFF6FF' },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
    });
    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#0B63F6',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#0B63F6',
      wickDownColor: '#EF4444',
    });
    series.setData(fallbackCandles);
    chart.timeScale().fitContent();

    const handleResize = () => {
      if (ref.current) {
        chart.applyOptions({ width: ref.current.clientWidth });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  return <div ref={ref} className="min-h-[220px] overflow-hidden rounded-3xl border border-slate-200 bg-white" />;
}
