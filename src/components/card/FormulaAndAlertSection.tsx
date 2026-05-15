import Link from 'next/link';
import { ScrollText } from 'lucide-react';
import { ConditionAlertButton } from '@/components/alerts/ConditionAlertButton';
import type { FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';

export function FormulaAndAlertSection({ card, formula }: { card: DisplayCard; formula: FormulaDefinition }) {
  return (
    <section className="space-y-3 px-5">
      <h2 className="text-xl font-black">지표식 보기 / 알림 설정</h2>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-black text-[#0B63F6]">{formula.shortName}</p>
        <h3 className="mt-2 text-xl font-black">{formula.name}</h3>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{formula.description}</p>
        <div className="mt-4 grid gap-3">
          <ConditionAlertButton card={card} formula={formula} />
          <Link
            href={`/cards/${card.id}/formula`}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-[#0B63F6] bg-white text-sm font-black text-[#0B63F6]"
          >
            <ScrollText className="h-5 w-5" />
            조건식 자세히 보기
          </Link>
        </div>
      </div>
      <p className="text-center text-xs font-semibold leading-5 text-slate-500">
        본 정보는 조건 충족 사실을 보여주는 참고 정보이며, 매수·매도 추천이 아닙니다.
      </p>
    </section>
  );
}
