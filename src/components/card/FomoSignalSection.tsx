import { Copy, MousePointerClick, RotateCcw } from 'lucide-react';
import type { StockCard } from '@/data/mockStocks';

const icons = [RotateCcw, MousePointerClick, Copy];

export function FomoSignalSection({ card }: { card: StockCard }) {
  return (
    <section className="px-5">
      <h2 className="mb-3 text-xl font-black">투자자 반응</h2>
      <div className="grid gap-3">
        {card.fomoSignals.map((signal, index) => {
          const Icon = icons[index] ?? MousePointerClick;
          return (
            <div key={signal.label} className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-50 text-[#0B63F6]">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-base font-black text-slate-950">{signal.label}</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{signal.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
