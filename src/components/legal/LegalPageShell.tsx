import Link from 'next/link';
import { MobileShell } from '@/components/layout/MobileShell';

type LegalPageShellProps = {
  title: string;
  subtitle: string;
  effectiveDate: string;
  children: React.ReactNode;
};

export function LegalPageShell({ title, subtitle, effectiveDate, children }: LegalPageShellProps) {
  return (
    <MobileShell>
      <div className="px-5 pb-10 pt-8">
        <div className="glass-card rounded-[28px] px-5 py-6 text-slate-900">
          <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="rounded-full bg-[#EEF5FF] px-3 py-1 text-[#0B63F6]">법적 안내</span>
            <span>시행일 {effectiveDate}</span>
          </div>

          <header className="mb-6 space-y-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">{title}</h1>
            <p className="text-sm leading-6 text-slate-600">{subtitle}</p>
          </header>

          <div className="space-y-6 text-sm leading-7 text-slate-700">{children}</div>

          <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-200 pt-5 text-sm">
            <Link className="font-medium text-[#0B63F6] hover:underline" href="/privacy">
              개인정보처리방침
            </Link>
            <Link className="font-medium text-[#0B63F6] hover:underline" href="/investment-notice">
              투자 유의사항
            </Link>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
