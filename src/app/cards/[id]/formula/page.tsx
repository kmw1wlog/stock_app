import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { NativeAdCard } from '@/components/ads/NativeAdCard';
import { FormulaActionPanel } from '@/components/formula/FormulaActionPanel';
import { MobileShell } from '@/components/layout/MobileShell';
import { getFormulaForCard } from '@/lib/formulas/formulaCatalog';
import { getDisplayCard } from '@/lib/marketData';

export const dynamic = 'force-dynamic';

export default async function FormulaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await getDisplayCard(id);
  if (!card) {
    return (
      <MobileShell>
        <div className="space-y-5 px-5 pt-5">
          <Link href="/" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm" aria-label="뒤로">
            <ChevronLeft className="h-7 w-7" />
          </Link>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-sm font-bold text-slate-500">데이터 준비중</div>
        </div>
      </MobileShell>
    );
  }

  const formula = getFormulaForCard(card);
  return (
    <MobileShell>
      <div className="space-y-5 pb-28 pt-5">
        <header className="flex items-center gap-3 px-5">
          <Link href={`/cards/${id}`} className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm" aria-label="뒤로">
            <ChevronLeft className="h-7 w-7" />
          </Link>
          <div>
            <h1 className="text-3xl font-black">조건식 보기</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">{card.name} · {formula.shortName}</p>
          </div>
        </header>

        <section className="space-y-4 px-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black text-[#0B63F6]">{card.dataBasisLabel}</p>
            <h2 className="mt-2 text-2xl font-black">{formula.name}</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{formula.description}</p>
          </div>

          <InfoList title="조건 기준" items={formula.criteria} />
          <InfoList title="제외/주의 기준" items={formula.excludeRules} />

          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-lg font-black text-slate-950">주의</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{formula.riskNote}</p>
            <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">본 조건식은 매수·매도 추천이 아닌 참고용 조건입니다.</p>
          </div>

          <FormulaActionPanel card={card} formula={formula} />
        </section>
        <NativeAdCard source="formula" slotName="formula_bottom" title="조건 확인 후 참고 콘텐츠" />
      </div>
    </MobileShell>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm font-semibold leading-6 text-slate-600">
        {items.map((item) => <li key={item}>· {item}</li>)}
      </ul>
    </div>
  );
}
