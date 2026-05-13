'use client';

import { useEffect, useRef } from 'react';
import { useAppState } from '@/context/AppStateContext';

export function TradingViewMiniSymbolWidget({ symbol }: { symbol: string }) {
  return <TradingViewWidget symbol={symbol} mode="mini" />;
}

export function TradingViewAdvancedChartWidget({ symbol }: { symbol: string }) {
  return <TradingViewWidget symbol={symbol} mode="advanced" />;
}

export function TradingViewChartWidget({ symbol, advanced = false }: { symbol: string; advanced?: boolean }) {
  return <TradingViewWidget symbol={symbol} mode={advanced ? 'advanced' : 'mini'} />;
}

function TradingViewWidget({ symbol, mode }: { symbol: string; mode: 'mini' | 'advanced' }) {
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
    script.src =
      mode === 'advanced'
        ? 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
        : 'https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify(
      mode === 'advanced'
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
    logEvent('widget_view', { provider: 'tradingview', widget: mode === 'advanced' ? 'advanced_chart' : 'mini_symbol_overview', symbol, isWidget: true });
  }, [logEvent, mode, symbol]);

  return <div ref={ref} className={mode === 'advanced' ? 'h-[420px] min-h-[420px] overflow-hidden rounded-3xl border border-slate-200 bg-white' : 'min-h-[220px] overflow-hidden rounded-3xl border border-slate-200 bg-white'} />;
}
