'use client';

import { useEffect } from 'react';

export function AdSlot({ slot, className = '' }: { slot?: string; className?: string }) {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || !slot) {
      return;
    }
    try {
      (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle?.push({});
    } catch {
      // Ads are optional in Phase 1.
    }
  }, [slot]);

  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || !slot) {
    return (
      <div className={`rounded-3xl border border-dashed border-slate-300 bg-white p-4 text-center text-xs font-bold text-slate-400 ${className}`}>
        광고 슬롯
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle block ${className}`}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
