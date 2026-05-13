import { SectionHeader } from '@/components/common/SectionHeader';

export function ExploreSection({ title, hint, action = '더보기', children }: { title: string; hint?: string; action?: string; children: React.ReactNode }) {
  return (
    <section className="px-5">
      <SectionHeader title={title} action={action} />
      {hint ? <p className="mb-3 text-xs font-black text-[#0B63F6]">{hint}</p> : null}
      {children}
    </section>
  );
}
