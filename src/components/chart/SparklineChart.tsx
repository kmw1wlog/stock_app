import { Sparkline } from '@/components/common/Sparkline';

export function SparklineChart({ tone = 'blue' }: { tone?: 'blue' | 'green' | 'red' | 'orange' }) {
  return (
    <div className="grid min-h-[180px] place-items-center rounded-3xl border border-slate-200 bg-white">
      <Sparkline tone={tone} />
    </div>
  );
}
