'use client';

import { ScrollText } from 'lucide-react';
import { ConditionAlertButton } from '@/components/alerts/ConditionAlertButton';
import { MtsViewButton } from '@/components/mts/MtsViewButton';
import type { FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';

export function CardActionPanel({ card, formula }: { card: DisplayCard; formula: FormulaDefinition }) {
  return (
    <section className="space-y-3 px-5">
      <div className="grid grid-cols-1 gap-3">
        <ConditionAlertButton card={card} formula={formula} />
        <MtsViewButton card={card} source="detail" />
        <a
          href={`/cards/${card.id}/formula`}
          onClick={(event) => {
            event.preventDefault();
            window.setTimeout(() => window.location.assign(`/cards/${card.id}/formula`), 0);
          }}
          className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-[#0B63F6] bg-white text-sm font-black text-[#0B63F6]"
        >
          <ScrollText className="h-5 w-5" />
          조건식 자세히 보기
        </a>
      </div>
      <p className="text-center text-xs font-semibold leading-5 text-slate-500">
        본 정보는 조건 충족 사실을 보여주는 참고 정보이며, 매수·매도 추천이 아닙니다. 투자 판단은 이용자 본인에게 있습니다.
      </p>
    </section>
  );
}
