'use client';

import { useEffect, useRef } from 'react';
import { useAppState } from '@/context/AppStateContext';

export function TradingViewChartWidget({ symbol, advanced = false }: { symbol: string; advanced?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { logEvent } = useAppState();

  useEffect(() => {
    if (!ref.current || process.env.NEXT_PUBLIC_ENABLE_TRADINGVIEW_WIDGETS !== 'true') {
      return;
    }
    ref.current.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'tradingview-widget-container__widget';
    const script = document.createElement('script');
    script.src = advanced
      ? 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
      : 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify(
      advanced
        ? {
            autosize: true,
            symbol,
            interval: 'D',
            timezone: 'Asia/Seoul',
            theme: 'light',
            style: '1',
            locale: 'kr',
            enable_publishing: false,
            hide_top_toolbar: false,
            allow_symbol_change: false,
            support_host: 'https://www.tradingview.com',
          }
        : {
            symbol,
            width: '100%',
            height: 220,
            locale: 'kr',
            dateRange: '1M',
            colorTheme: 'light',
            isTransparent: true,
            autosize: false,
            largeChartUrl: '',
          },
    );
    ref.current.appendChild(container);
    ref.current.appendChild(script);
    logEvent('widget_view', { provider: 'tradingview', widget: advanced ? 'advanced_chart' : 'mini_chart', symbol, isWidget: true });
  }, [advanced, logEvent, symbol]);

  return <div ref={ref} className={advanced ? 'h-[420px] min-h-[420px] overflow-hidden rounded-3xl border border-slate-200 bg-white' : 'min-h-[220px] overflow-hidden rounded-3xl border border-slate-200 bg-white'} />;
}
