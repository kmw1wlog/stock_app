'use client';

import { useEffect } from 'react';
import { useRef } from 'react';
import { useAppState } from '@/context/AppStateContext';

export function CoinGeckoPriceWidget({ coinId }: { coinId: string }) {
  const { logEvent } = useAppState();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_COINGECKO_WIDGETS !== 'true') {
      return;
    }
    if (!document.querySelector('script[data-coingecko-widget]')) {
      const script = document.createElement('script');
      script.src = 'https://widgets.coingecko.com/gecko-coin-price-chart-widget.js';
      script.async = true;
      script.dataset.coingeckoWidget = 'true';
      document.body.appendChild(script);
    }
    if (ref.current) {
      ref.current.innerHTML = '';
      const widget = document.createElement('gecko-coin-price-chart-widget');
      widget.setAttribute('locale', 'ko');
      widget.setAttribute('outlined', 'false');
      widget.setAttribute('coin-id', coinId);
      widget.setAttribute('initial-currency', 'usd');
      ref.current.appendChild(widget);
    }
    logEvent('widget_view', { provider: 'coingecko', widget: 'price_chart', coinId });
  }, [coinId, logEvent]);

  if (process.env.NEXT_PUBLIC_ENABLE_COINGECKO_WIDGETS !== 'true') {
    return null;
  }

  return (
    <div ref={ref} className="min-h-[220px] overflow-hidden rounded-3xl border border-slate-200 bg-white p-2" />
  );
}
