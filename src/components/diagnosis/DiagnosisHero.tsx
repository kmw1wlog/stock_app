import { CheckCircle2 } from 'lucide-react';

export function DiagnosisHero({ title, bullets }: { title: string; bullets: string[] }) {
  return (
    <section className="mx-5 rounded-[28px] deep-card p-6 text-white shadow-xl shadow-blue-950/20">
      <p className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-black text-blue-100">진단 기준</p>
      <h1 className="text-3xl font-black leading-tight">{title}</h1>
      <div className="mt-5 space-y-3">
        {bullets.map((bullet) => (
          <p key={bullet} className="flex gap-3 text-sm font-semibold leading-6 text-white/90">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-300" />
            {bullet}
          </p>
        ))}
      </div>
    </section>
  );
}
