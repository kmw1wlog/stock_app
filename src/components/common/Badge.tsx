type BadgeProps = {
  children: React.ReactNode;
  tone?: 'blue' | 'green' | 'orange' | 'red' | 'violet' | 'gray';
};

const toneClass = {
  blue: 'bg-blue-50 text-[#0B63F6] ring-blue-100',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  orange: 'bg-orange-50 text-orange-700 ring-orange-100',
  red: 'bg-red-50 text-red-600 ring-red-100',
  violet: 'bg-violet-50 text-violet-700 ring-violet-100',
  gray: 'bg-slate-50 text-slate-600 ring-slate-100',
};

export function Badge({ children, tone = 'blue' }: BadgeProps) {
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black ring-1 ${toneClass[tone]}`}>{children}</span>;
}
