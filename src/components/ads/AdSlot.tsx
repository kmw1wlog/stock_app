'use client';

import { useEffect } from 'react';

export function AdSlot({ slot, className = '' }: { slot?: string; className?: string }) {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || !slot) return;
    try {
      (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle?.push({});
    } catch {
      // Ads are optional and must not block the app.
    }
  }, [slot]);

  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || !slot) {
    return (
      <div className={`rounded-3xl border border-dashed border-slate-300 bg-white p-4 text-center ${className}`}>
        <p className="text-xs font-black text-slate-500">광고 슬롯</p>
        <p className="mt-1 text-[11px] font-semibold leading-4 text-slate-400">앱의 조건식 후보 선정 및 알림 결과와 무관합니다.</p>
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
