import Link from 'next/link';
import { ChevronLeft, Copy } from 'lucide-react';
import { MobileShell } from '@/components/layout/MobileShell';
import { getDisplayCard } from '@/lib/marketData';

export default async function FormulaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await getDisplayCard(id);
  const lines = [`종목=${card?.symbol ?? id}`, '가격·거래량·공시·뉴스 라벨 확인', '매수 지시가 아닌 참고 지표식'];
  return (
    <MobileShell>
      <div className="space-y-5 pb-28 pt-5">
        <header className="flex items-center gap-3 px-5">
          <Link href={`/cards/${id}`} className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm"><ChevronLeft className="h-7 w-7" /></Link>
          <div>
            <h1 className="text-3xl font-black">지표식 보기</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">{card ? `${card.name} · ${card.dataBasisLabel}` : '데이터 준비중'}</p>
          </div>
        </header>
        <section className="space-y-4 px-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black">복사용 참고 지표식</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">조건식 조합 캔버스는 제공하지 않습니다. 아래 내용은 실제 투자 결과를 보장하지 않는 참고식입니다.</p>
            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/30 p-4 text-sm leading-8 text-slate-800">
              {lines.map((line, index) => <div key={line} className="grid grid-cols-[28px_1fr] gap-3"><span className="font-mono text-slate-400">{index + 1}</span><span className="font-semibold">{line}</span></div>)}
            </div>
          </div>
          <button className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#0B63F6] text-base font-black text-white shadow-lg shadow-blue-500/25"><Copy className="h-5 w-5" />복사</button>
          <p className="px-1 text-xs font-semibold leading-5 text-slate-500">조건식은 참고용으로 제공되며 실제 투자 결과를 보장하지 않습니다.</p>
        </section>
      </div>
    </MobileShell>
  );
}
