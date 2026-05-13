'use client';

import { Bookmark, Heart, MessageCircle, MoreHorizontal, X } from 'lucide-react';

type HomeActionButtonsProps = {
  onSkip: () => void;
  onLike: () => void;
  onSave: () => void;
  onOpinion: () => void;
  onMore: () => void;
};

const actions = [
  { label: '넘기기', icon: X, tone: 'text-slate-500', ring: 'border-slate-200' },
  { label: '관심', icon: Heart, tone: 'text-rose-500', ring: 'border-rose-100' },
  { label: '저장', icon: Bookmark, tone: 'text-[#0B63F6]', ring: 'border-blue-100' },
  { label: '의견', icon: MessageCircle, tone: 'text-violet-500', ring: 'border-violet-100' },
  { label: '더보기', icon: MoreHorizontal, tone: 'text-slate-500', ring: 'border-slate-200' },
];

export function HomeActionButtons({ onSkip, onLike, onSave, onOpinion, onMore }: HomeActionButtonsProps) {
  const handlers = [onSkip, onLike, onSave, onOpinion, onMore];
  return (
    <div className="grid grid-cols-5 gap-2 px-1">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <button key={action.label} type="button" onClick={handlers[index]} className="flex flex-col items-center gap-2">
            <span className={`grid h-[52px] w-[52px] place-items-center rounded-full border bg-white shadow-lg shadow-slate-200/70 ${action.ring}`}>
              <Icon className={`h-6 w-6 ${action.tone}`} strokeWidth={2.6} />
            </span>
            <span className="text-xs font-bold text-slate-700">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
