export function ThemeMapCard({ title, value, tone = 'blue', hint }: { title: string; value: string; tone?: 'blue' | 'green' | 'orange'; hint?: string }) {
  const bg = tone === 'green' ? 'from-emerald-50 to-white' : tone === 'orange' ? 'from-orange-50 to-white' : 'from-blue-50 to-white';
  return (
    <div className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${bg} p-4`}>
      <p className="text-xs font-black text-slate-500">{title}</p>
      <p className="mt-2 text-xl font-black text-slate-950">{value}</p>
      {hint ? <p className="mt-1 line-clamp-2 text-[11px] font-bold leading-4 text-slate-500">{hint}</p> : null}
      <div className="mt-4 grid grid-cols-5 gap-1">
        {Array.from({ length: 15 }).map((_, index) => (
          <span key={index} className={`h-5 rounded ${index % 4 === 0 ? 'bg-red-300' : index % 3 === 0 ? 'bg-emerald-300' : 'bg-blue-200'}`} />
        ))}
      </div>
    </div>
  );
}
