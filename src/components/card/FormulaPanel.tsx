'use client';

import { useEffect, useState } from 'react';
import { Bookmark, Copy, Lightbulb, LockKeyhole, Repeat2 } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { PremiumLockCard } from '@/components/common/PremiumLockCard';
import { useAppState } from '@/context/AppStateContext';
import type { StockCard } from '@/data/mockStocks';

const platforms = [
  { key: 'yesTrader', label: '예스트레이더' },
  { key: 'kiwoom', label: '키움' },
  { key: 'tradingView', label: 'TradingView' },
] as const;

type PlatformKey = (typeof platforms)[number]['key'];

export function FormulaPanel({ card }: { card: StockCard }) {
  const [platform, setPlatform] = useState<PlatformKey>('yesTrader');
  const { copyFormula, saveCard, showToast, logEvent } = useAppState();
  const formula = card.formula[platform];
  const copyText = [...formula, '', '[지표식]', ...card.formula.indicator].join('\n');

  useEffect(() => {
    logEvent('formula_view', { cardKey: card.id, platform, market: card.marketType, chartSetupType: card.chartSetupType });
  }, [card.id, card.marketType, card.chartSetupType, platform, logEvent]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(copyText);
    copyFormula(`${card.id}-${platform}`, { cardKey: card.id, platform, market: card.marketType, chartSetupType: card.chartSetupType });
  };

  const handleSameSeat = () => {
    logEvent('chart_seat_related_cards_click', { cardKey: card.id, platform, market: card.marketType, chartSetupType: card.chartSetupType });
    showToast('같은 차트자리 종목 보기 요청을 기록했습니다.');
  };

  const handleReactedCards = () => {
    logEvent('chart_seat_click', { cardKey: card.id, platform, market: card.marketType, chartSetupType: card.chartSetupType });
    showToast('이 차트자리 조건식 확인 요청을 기록했습니다.');
  };

  return (
    <section className="space-y-4 px-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex gap-4">
          <div className="h-20 w-20 shrink-0 rounded-2xl bg-gradient-to-br from-blue-900 to-blue-500" />
          <div>
            <h1 className="text-2xl font-black">{card.name}</h1>
            <p className="mt-1 text-base font-black text-[#0B63F6]">{card.theme} 차트자리 카드</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">{card.chartSetupType} 조건식</p>
          </div>
        </div>
        <div className="mt-4 rounded-2xl bg-blue-50 p-4">
          <p className="text-sm font-black text-[#0B63F6]">조건식까지 확인한 사용자가 늘어난 카드입니다.</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">조건식은 복사용 완성본으로만 제공됩니다. 조합 캔버스나 매수 지시는 제공하지 않습니다.</p>
        </div>
      </div>
      <div className="grid grid-cols-3 border-b border-slate-200">
        {platforms.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setPlatform(item.key)}
            className={platform === item.key ? 'border-b-4 border-[#0B63F6] py-4 text-sm font-black text-[#0B63F6]' : 'py-4 text-sm font-black text-slate-500'}
          >
            {item.label}
          </button>
        ))}
      </div>
      <FormulaBlock title="종목 검색식" lines={formula} onCopy={handleCopy} />
      <FormulaBlock title="지표식" lines={card.formula.indicator} onCopy={handleCopy} />
      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-[#0B63F6]" />
          <h2 className="text-xl font-black">왜 이 조건식인가요?</h2>
        </div>
        <p className="text-sm font-semibold leading-7 text-slate-600">
          {card.chartSetupDescription} 거래대금, 추세 회복, 위험 필터를 함께 보도록 구성했습니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone="green">복사 전용</Badge>
          <Badge>차트자리 조건식</Badge>
          <Badge tone="orange">위험 기준 확인 필요</Badge>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={handleSameSeat} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-3 text-sm font-black text-[#0B63F6]">
          <Repeat2 className="h-5 w-5" />
          같은 차트자리 종목 보기
        </button>
        <button onClick={handleReactedCards} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-3 text-sm font-black text-[#0B63F6]">
          <LockKeyhole className="h-5 w-5" />
          차트자리 반응 카드 보기
        </button>
      </div>
      <PremiumLockCard source="formula_bottom" />
      <p className="px-1 text-xs font-semibold leading-5 text-slate-500">조건식은 참고용으로 제공되며 실제 투자 결과를 보장하지 않습니다.</p>
      <div className="fixed bottom-[78px] left-1/2 z-30 grid w-full max-w-[430px] -translate-x-1/2 grid-cols-2 gap-3 border-t border-slate-200 bg-white/95 p-4 backdrop-blur-xl">
        <button onClick={handleCopy} className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#0B63F6] text-base font-black text-white shadow-lg shadow-blue-500/25">
          <Copy className="h-5 w-5" />
          복사하기
        </button>
        <button onClick={() => saveCard(card.id, { market: card.marketType, symbol: card.symbol, chartSetupType: card.chartSetupType })} className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-[#0B63F6] bg-white text-base font-black text-[#0B63F6]">
          <Bookmark className="h-5 w-5" />
          보관함 저장
        </button>
      </div>
    </section>
  );
}

function FormulaBlock({ title, lines, onCopy }: { title: string; lines: string[]; onCopy: () => void }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-black">{title}</h2>
        <button onClick={onCopy} className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-black text-[#0B63F6]">
          <Copy className="h-4 w-4" />
          복사
        </button>
      </div>
      <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-4 text-sm leading-8 text-slate-800">
        {lines.map((line, index) => (
          <div key={`${line}-${index}`} className="grid grid-cols-[28px_1fr] gap-3">
            <span className="font-mono text-slate-400">{index + 1}</span>
            <span className="font-semibold">{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
