'use client';

import { Bell, Bookmark, MoreHorizontal, ScrollText, X } from 'lucide-react';

type HomeActionButtonsProps = {
  onSkip: () => void;
  onAlert: () => void;
  onSave: () => void;
  onFormula: () => void;
  onMore: () => void;
};

const actions = [
  { label: '넘기기', icon: X, tone: 'text-slate-500', ring: 'border-slate-200' },
  { label: '알림', icon: Bell, tone: 'text-amber-500', ring: 'border-amber-100' },
  { label: '저장', icon: Bookmark, tone: 'text-[#0B63F6]', ring: 'border-blue-100' },
  { label: '조건식', icon: ScrollText, tone: 'text-violet-500', ring: 'border-violet-100' },
  { label: '상세', icon: MoreHorizontal, tone: 'text-slate-500', ring: 'border-slate-200' },
];

export function HomeActionButtons({ onSkip, onAlert, onSave, onFormula, onMore }: HomeActionButtonsProps) {
  const handlers = [onSkip, onAlert, onSave, onFormula, onMore];
  return (
    <div className="grid grid-cols-5 gap-2 px-1">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <button key={action.label} type="button" onClick={handlers[index]} className="flex flex-col items-center gap-1.5">
            <span className={`grid h-[46px] w-[46px] place-items-center rounded-full border bg-white shadow-lg shadow-slate-200/70 ${action.ring}`}>
              <Icon className={`h-5 w-5 ${action.tone}`} strokeWidth={2.6} />
            </span>
            <span className="text-[11px] font-bold text-slate-700">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
