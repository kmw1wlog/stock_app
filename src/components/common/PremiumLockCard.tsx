'use client';

import { LockKeyhole, Sparkles } from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';

export function PremiumLockCard({ source, className = '' }: { source: string; className?: string }) {
  const { showToast, logEvent } = useAppState();

  return (
    <section className={`rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#0B63F6] text-white">
          <LockKeyhole className="h-6 w-6" />
        </span>
        <div>
          <p className="text-lg font-black text-slate-950">놓친 급등 카드 전체 보기</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">오늘 +5% 이상 반응한 카드 6개가 있습니다.</p>
        </div>
      </div>
      <button
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0B63F6] text-sm font-black text-white shadow-lg shadow-blue-500/25"
        onClick={() => {
          logEvent('premium_lock_click', { source });
          showToast('프리미엄 관심으로 기록했습니다.');
        }}
      >
        <Sparkles className="h-5 w-5" />
        프리미엄으로 보기
      </button>
    </section>
  );
}
