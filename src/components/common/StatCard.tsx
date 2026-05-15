type StatCardProps = {
  label: string;
  value: string;
  tone?: 'blue' | 'green' | 'orange' | 'red' | 'gray';
};

const valueTone = {
  blue: 'text-[#0B63F6]',
  green: 'text-emerald-600',
  orange: 'text-orange-500',
  red: 'text-red-500',
  gray: 'text-slate-900',
};

export function StatCard({ label, value, tone = 'gray' }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <p className="text-[11px] font-bold text-slate-500">{label}</p>
      <p className={`mt-1 text-lg font-black ${valueTone[tone]}`}>{value}</p>
    </div>
  );
}
