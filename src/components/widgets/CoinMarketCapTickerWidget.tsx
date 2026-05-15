'use client';

import { useEffect } from 'react';
import { useAppState } from '@/context/AppStateContext';

export function CoinMarketCapTickerWidget({ currencyId }: { currencyId: string }) {
  const { logEvent } = useAppState();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_CMC_WIDGETS !== 'true') {
      return;
    }
    if (!document.querySelector('script[data-cmc-widget]')) {
      const script = document.createElement('script');
      script.src = 'https://files.coinmarketcap.com/static/widget/currency.js';
      script.async = true;
      script.dataset.cmcWidget = 'true';
      document.body.appendChild(script);
    }
    logEvent('widget_view', { provider: 'coinmarketcap', widget: 'ticker', currencyId });
  }, [currencyId, logEvent]);

  if (process.env.NEXT_PUBLIC_ENABLE_CMC_WIDGETS !== 'true') {
    return null;
  }

  return <div className="coinmarketcap-currency-widget" data-currencyid={currencyId} data-base="USD" data-secondary="" data-ticker="true" data-rank="false" data-marketcap="false" data-volume="false" data-statsticker="false" data-stats="USD" />;
}
