'use client';

import { LockKeyhole, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { useAppState } from '@/context/AppStateContext';

export function PremiumLockCard({
  source,
  feature = 'missed_cards',
  title = '놓친 급등 카드 전체 보기',
  description = '무료로는 일부만 보여드립니다. 같은 차트자리와 조건식 확인 랭킹 전체는 프리미엄에서 열립니다.',
  className = '',
}: {
  source: string;
  feature?: string;
  title?: string;
  description?: string;
  className?: string;
}) {
  const { showToast, logEvent } = useAppState();

  useEffect(() => {
    logEvent(source.startsWith('ranking') ? 'ranking_premium_lock_view' : 'premium_lock_view', { source, feature });
  }, [feature, logEvent, source]);

  return (
    <section className={`rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 ${className}`}>
      <div className="flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#0B63F6] text-white">
          <LockKeyhole className="h-6 w-6" />
        </span>
        <div>
          <p className="text-lg font-black text-slate-950">{title}</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{description}</p>
        </div>
      </div>
      <button
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0B63F6] text-sm font-black text-white shadow-lg shadow-blue-500/25"
        onClick={() => {
          logEvent(source.startsWith('ranking') ? 'ranking_premium_lock_click' : 'premium_lock_click', { source, feature });
          showToast('프리미엄 관심으로 기록했습니다.');
        }}
      >
        <Sparkles className="h-5 w-5" />
        프리미엄으로 보기
      </button>
    </section>
  );
}
