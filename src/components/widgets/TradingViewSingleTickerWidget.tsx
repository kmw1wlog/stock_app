'use client';

import { useEffect, useRef } from 'react';
import { useAppState } from '@/context/AppStateContext';

export function TradingViewSingleTickerWidget({ symbol }: { symbol: string }) {
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
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol,
      width: '100%',
      isTransparent: true,
      colorTheme: 'light',
      locale: 'kr',
    });
    ref.current.appendChild(container);
    ref.current.appendChild(script);
    logEvent('widget_view', { provider: 'tradingview', widget: 'single_ticker', symbol });
  }, [logEvent, symbol]);

  return <div ref={ref} className="min-h-[96px] rounded-2xl border border-slate-200 bg-white p-2" />;
}
