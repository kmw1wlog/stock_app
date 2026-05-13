import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { FormulaPanel } from '@/components/card/FormulaPanel';
import { MobileShell } from '@/components/layout/MobileShell';
import { getStockCard } from '@/data/mockStocks';

export default async function FormulaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = getStockCard(id);

  return (
    <MobileShell>
      <div className="space-y-5 pb-28 pt-5">
        <header className="flex items-center gap-3 px-5">
          <Link href={`/cards/${card.id}`} className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm">
            <ChevronLeft className="h-7 w-7" />
          </Link>
          <div>
            <h1 className="text-3xl font-black">조건식 보기</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">{card.name} · {card.theme}</p>
          </div>
        </header>
        <FormulaPanel card={card} />
      </div>
    </MobileShell>
  );
}
