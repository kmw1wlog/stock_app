'use client';

import { Bell, Bookmark, Info, Layers3, Share2 } from 'lucide-react';

type HomeCardActionDockProps = {
  onSave: () => void;
  onSimilar: () => void;
  onAlert: () => void;
  onShare: () => void;
  onDetail: () => void;
  className?: string;
  compact?: boolean;
};

export function HomeCardActionDock({ onSave, onSimilar, onAlert, onShare, onDetail, className = '', compact = false }: HomeCardActionDockProps) {
  const sideSize = compact ? 'h-11 w-11' : 'h-[50px] w-[50px]';
  const iconSize = compact ? 'h-[17px] w-[17px]' : 'h-[18px] w-[18px]';
  const mainHeight = compact ? 'h-11' : 'h-[50px]';
  const labelClass = 'mt-1 text-[10px] font-black';

  return (
    <div className={`mx-auto flex max-w-[390px] items-center gap-1.5 rounded-full border border-[#E2EAF7] bg-white/96 px-2 py-1.5 shadow-[0_12px_28px_rgba(16,32,51,0.10)] backdrop-blur ${className}`}>
      <button type="button" onClick={onSave} className={`flex ${sideSize} shrink-0 flex-col items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/60`} aria-label="관심종목 저장">
        <Bookmark className={iconSize} />
        {!compact ? <span className={labelClass}>저장</span> : null}
      </button>
      <button type="button" onClick={onSimilar} className={`flex ${sideSize} shrink-0 flex-col items-center justify-center rounded-full bg-violet-50 text-violet-600 shadow-sm shadow-violet-100/60`} aria-label="유사 보기">
        <Layers3 className={iconSize} />
        {!compact ? <span className={labelClass}>유사</span> : null}
      </button>
      <button
        type="button"
        onClick={onAlert}
        className={`flex ${mainHeight} min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#2563EB_0%,#4F46E5_100%)] px-4 text-sm font-black text-white shadow-[0_10px_20px_rgba(37,99,235,0.28)]`}
        aria-label="이 조건으로 알림 받기"
      >
        <Bell className={`${iconSize} shrink-0`} />
        <span className="truncate">알림받기</span>
      </button>
      <button type="button" onClick={onShare} className={`flex ${sideSize} shrink-0 flex-col items-center justify-center rounded-full bg-cyan-50 text-cyan-700 shadow-sm shadow-cyan-100/60`} aria-label="카드 공유">
        <Share2 className={iconSize} />
        {!compact ? <span className={labelClass}>공유</span> : null}
      </button>
      <button type="button" onClick={onDetail} className={`flex ${sideSize} shrink-0 flex-col items-center justify-center rounded-full bg-[#F4F7FB] text-slate-600`} aria-label="상세 보기">
        <Info className={iconSize} />
        {!compact ? <span className={labelClass}>상세</span> : null}
      </button>
    </div>
  );
}
