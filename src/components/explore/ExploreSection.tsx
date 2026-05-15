import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export function ExploreSection({
  title,
  hint,
  action = '더보기',
  actionHref,
  children,
}: {
  title: string;
  hint?: string;
  action?: string;
  actionHref?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-slate-950">{title}</h2>
        {actionHref ? (
          <Link href={actionHref} className="flex shrink-0 items-center gap-1 text-sm font-black text-[#0B63F6]">
            {action}
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="text-sm font-black text-slate-400">{action}</span>
        )}
      </div>
      {hint ? <p className="mb-3 text-xs font-black text-[#0B63F6]">{hint}</p> : null}
      {children}
    </section>
  );
}
