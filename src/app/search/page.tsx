import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { MobileShell } from '@/components/layout/MobileShell';
import { StockSearchBox } from '@/components/search/StockSearchBox';
import { getSearchableStocks } from '@/lib/search/stockSearch';

export default async function SearchPage() {
  const cards = await getSearchableStocks(300);
  return (
    <MobileShell>
      <div className="space-y-5 px-5 py-6">
        <header className="flex items-center gap-3">
          <Link href="/explore" className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm" aria-label="뒤로">
            <ChevronLeft className="h-7 w-7" />
          </Link>
          <div>
            <h1 className="text-3xl font-black">종목 검색</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">종목명, 심볼, 테마, 라벨로 찾습니다.</p>
          </div>
        </header>
        <StockSearchBox cards={cards} />
      </div>
    </MobileShell>
  );
}
