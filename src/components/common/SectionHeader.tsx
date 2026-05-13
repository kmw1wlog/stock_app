export function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-lg font-black text-slate-950">{title}</h2>
      {action ? <button className="text-xs font-black text-[#0B63F6]">{action}</button> : null}
    </div>
  );
}
