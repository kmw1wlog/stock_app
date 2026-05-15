'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft, ExternalLink, RotateCcw } from 'lucide-react';
import { MtsViewButton } from '@/components/mts/MtsViewButton';
import { useAppState } from '@/context/AppStateContext';
import { buildCardEvidenceLine, type FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';

function scoreLabel(card: DisplayCard) {
  let score = 55;
  if ((card.changePct ?? 0) > 0) score += 10;
  if ((card.amount ?? 0) > 0) score += 10;
  if (card.chartSetupType) score += 8;
  if (card.labels.some((label) => /뉴스|공시|SEC/.test(label))) score += 6;
  if (Math.abs(card.changePct ?? 0) >= 10) score -= 8;
  const bounded = Math.max(0, Math.min(100, score));
  const label = bounded >= 85 ? '매우좋음' : bounded >= 70 ? '좋음' : bounded >= 55 ? '보통' : bounded >= 40 ? '유의' : '위험';
  return { score: bounded, label };
}

function volatilityLabel(card: DisplayCard) {
  const abs = Math.abs(card.changePct ?? 0);
  if (!abs) return '자료 부족';
  if (abs < 3) return '안정';
  if (abs < 6) return '보통';
  if (abs < 10) return '유의';
  return '위험';
}

function amountLabel(card: DisplayCard) {
  if (!card.amount && !card.volume) return '자료 부족';
  if ((card.amount ?? 0) > 0) return '거래대금 확인';
  return '거래량 확인';
}

type StockCardBackProps = {
  card: DisplayCard;
  formula: FormulaDefinition;
  sameThemeCards: DisplayCard[];
  sameChartCards: DisplayCard[];
  onShowFront: () => void;
};

export function StockCardBack({ card, formula, sameThemeCards, sameChartCards, onShowFront }: StockCardBackProps) {
  const { logEvent } = useAppState();
  const diagnosis = scoreLabel(card);
  const evidence = buildCardEvidenceLine(card);
  const topTheme = sameThemeCards.slice(0, 3);
  const topChart = sameChartCards.slice(0, 3);

  return (
    <section className="flex h-full flex-col overflow-y-auto rounded-[30px] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10">
      <div className="sticky top-0 z-10 -mx-1 mb-3 flex items-center justify-between bg-white/95 pb-2 backdrop-blur">
        <button type="button" onClick={onShowFront} className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-2 text-xs font-black text-slate-700">
          <ArrowLeft className="h-4 w-4" />
          앞면
        </button>
        <p className="text-xs font-black text-[#0B63F6]">근거 상세</p>
      </div>

      <h2 className="text-2xl font-black text-slate-950">{card.name}</h2>
      <p className="mt-1 text-sm font-bold text-slate-500">{card.symbol} · {card.marketLabel}</p>

      <Section title="왜 이 카드가 떴나요?">
        <InfoRow label="시장 데이터" value={evidence} />
        <InfoRow label="뉴스/공시" value={card.labels.find((label) => /뉴스|공시|SEC/.test(label)) ?? '표시 가능한 데이터 없음'} />
        <InfoRow label="시간외 반응" value={card.market === 'KR' ? '시간외 데이터 제공처 확인 필요' : '해당 시장은 위젯/공식 데이터 기준'} />
      </Section>

      <Section title="조건식 상세">
        <p className="text-base font-black text-slate-950">{formula.name}</p>
        <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{formula.userIntent}</p>
        <List title="조건 기준" items={formula.criteria} />
        <List title="제외/주의 기준" items={formula.excludeRules} />
        <p className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-800">{formula.riskNote}</p>
      </Section>

      <Section title="종목 진단 요약">
        <div className="grid grid-cols-2 gap-2">
          <MiniMetric label="진단점수" value={`${diagnosis.score}/100 · ${diagnosis.label}`} />
          <MiniMetric label="수급" value="자료 준비중" />
          <MiniMetric label="거래" value={amountLabel(card)} />
          <MiniMetric label="변동성" value={volatilityLabel(card)} />
        </div>
      </Section>

      <Section title="관련 종목">
        <RelatedGroup title="같은 테마" cards={topTheme} sourceCard={card} />
        <RelatedGroup title="같은 차트자리" cards={topChart} sourceCard={card} />
      </Section>

      <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
        <button type="button" onClick={onShowFront} className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-800">
          <RotateCcw className="h-4 w-4" />
          앞면으로
        </button>
        <Link
          href={`/cards/${card.id}/formula`}
          onClick={() => logEvent('home_formula_click', { cardKey: card.id, symbol: card.symbol, market: card.market, source: 'flip_card_back' })}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#0B63F6] text-sm font-black text-white"
        >
          조건식 자세히 보기
        </Link>
      </div>
      <MtsViewButton card={card} source="home" variant="secondary" label="MTS에서 보기" className="mt-2" />
      <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">본 정보는 조건 충족 사실을 보여주는 참고 정보이며, 매수·매도 추천이 아닙니다.</p>
    </section>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-black text-slate-950">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2 flex gap-3 rounded-2xl bg-white px-3 py-2">
      <span className="w-20 shrink-0 text-xs font-black text-slate-500">{label}</span>
      <span className="text-xs font-bold leading-5 text-slate-800">{value}</span>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-3">
      <p className="mb-1 text-xs font-black text-slate-500">{title}</p>
      <div className="space-y-1">
        {items.slice(0, 4).map((item) => (
          <p key={item} className="text-xs font-semibold leading-5 text-slate-700">- {item}</p>
        ))}
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-3">
      <p className="text-[11px] font-black text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}

function RelatedGroup({ title, cards, sourceCard }: { title: string; cards: DisplayCard[]; sourceCard: DisplayCard }) {
  const { logEvent } = useAppState();
  return (
    <div className="mt-3">
      <p className="mb-2 text-xs font-black text-slate-500">{title}</p>
      <div className="grid grid-cols-3 gap-2">
        {cards.length ? cards.map((card) => (
          <Link
            key={card.id}
            href={`/cards/${card.id}`}
            onClick={() => logEvent('related_stock_click', { cardKey: sourceCard.id, targetCardKey: card.id, symbol: card.symbol, source: 'flip_card_back' })}
            className="rounded-2xl bg-white px-2 py-3 text-center"
          >
            <p className="truncate text-xs font-black text-slate-950">{card.name}</p>
            <p className={(card.changePct ?? 0) < 0 ? 'mt-1 text-[11px] font-bold text-blue-600' : 'mt-1 text-[11px] font-bold text-red-600'}>
              {typeof card.changePct === 'number' ? `${card.changePct > 0 ? '+' : ''}${card.changePct.toFixed(1)}%` : '기준 확인'}
            </p>
          </Link>
        )) : (
          <div className="col-span-3 rounded-2xl bg-white px-3 py-3 text-center text-xs font-bold text-slate-500">관련 데이터 준비중</div>
        )}
      </div>
      {title.includes('차트') ? (
        <Link href={`/cards/${sourceCard.id}/formula`} className="mt-2 flex h-10 items-center justify-center gap-1 rounded-2xl bg-white text-xs font-black text-[#0B63F6]">
          이 차트유형 조건식 보기
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}
