type ChipProps = {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
};

export function Chip({ children, active, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'shrink-0 rounded-full bg-[#0B63F6] px-4 py-2 text-sm font-black text-white shadow-lg shadow-blue-500/25'
          : 'shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600'
      }
    >
      {children}
    </button>
  );
}
