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
  { key: 'tradingView', label: '트레이딩뷰' },
] as const;

type PlatformKey = (typeof platforms)[number]['key'];

export function FormulaPanel({ card }: { card: StockCard }) {
  const [platform, setPlatform] = useState<PlatformKey>('yesTrader');
  const { copyFormula, saveCard, showToast, logEvent } = useAppState();
  const formula = card.formula[platform];
  const copyText = [...formula, '', '[지표식]', ...card.formula.indicator].join('\n');

  useEffect(() => {
    logEvent('formula_view', { cardId: card.id, platform });
  }, [card.id, platform, logEvent]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(copyText);
    copyFormula(`${card.id}-${platform}`);
  };

  const handleSameSeat = () => {
    logEvent('formula_same_seat_click', { cardId: card.id, platform });
    logEvent('reaction_zone_click', { cardId: card.id, platform, market: card.marketType });
    showToast('비슷한 반응 구간 보기 요청이 기록되었습니다.');
  };

  const handleReactedCards = () => {
    logEvent('formula_reacted_cards_click', { cardId: card.id, platform });
    showToast('이 조건식으로 반응한 카드 보기 요청이 기록되었습니다.');
  };

  return (
    <section className="space-y-4 px-5">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex gap-4">
          <div className="h-20 w-20 shrink-0 rounded-2xl bg-gradient-to-br from-blue-900 to-blue-500" />
          <div>
            <h1 className="text-2xl font-black">{card.name}</h1>
            <p className="mt-1 text-base font-black text-[#0B63F6]">{card.theme} 단기 카드</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">이 반응 구간의 플랫폼별 조건식</p>
          </div>
        </div>
        <div className="mt-4 rounded-2xl bg-blue-50 p-4">
          <p className="text-sm font-black text-[#0B63F6]">예스트레이더 사용자 복사 인기 카드입니다.</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">최근 7일 조건식 보기 클릭이 빠르게 늘었습니다.</p>
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
      <FormulaBlock title="종목검색식" lines={formula} onCopy={handleCopy} />
      <FormulaBlock title="지표식" lines={card.formula.indicator} onCopy={handleCopy} />
      <div className="rounded-3xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-[#0B63F6]" />
          <h2 className="text-xl font-black">왜 이 조합인가요?</h2>
        </div>
        <p className="text-sm font-semibold leading-7 text-slate-600">거래량 급증은 강한 수급 유입을 포착하고, 20일선 돌파는 추세 전환을 확인합니다. 뉴스 모멘텀은 최근 이슈가 붙은 종목을 선별하는 보조 기준입니다.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone="green">초보자 친화</Badge>
          <Badge>복사 인기</Badge>
          <Badge tone="orange">리스크 조건 추가 권장</Badge>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={handleSameSeat} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-3 text-sm font-black text-[#0B63F6]">
          <Repeat2 className="h-5 w-5" />
          비슷한 반응 구간 보기
        </button>
        <button onClick={handleReactedCards} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-3 text-sm font-black text-[#0B63F6]">
          <LockKeyhole className="h-5 w-5" />
          이 조건식 반응 카드 보기
        </button>
      </div>
      <PremiumLockCard source="formula_bottom" />
      <p className="px-1 text-xs font-semibold leading-5 text-slate-500">조건식은 참고용으로 제공되며, 실제 투자 결과를 보장하지 않습니다.</p>
      <div className="fixed bottom-[78px] left-1/2 z-30 grid w-full max-w-[430px] -translate-x-1/2 grid-cols-2 gap-3 border-t border-slate-200 bg-white/95 p-4 backdrop-blur-xl">
        <button onClick={handleCopy} className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#0B63F6] text-base font-black text-white shadow-lg shadow-blue-500/25">
          <Copy className="h-5 w-5" />
          복사하기
        </button>
        <button onClick={() => saveCard(card.id)} className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-[#0B63F6] bg-white text-base font-black text-[#0B63F6]">
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
          복사하기
        </button>
      </div>
      <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-4 text-sm leading-8 text-slate-800">
        {lines.map((line, index) => (
          <div key={line} className="grid grid-cols-[28px_1fr] gap-3">
            <span className="font-mono text-slate-400">{index + 1}</span>
            <span className="font-semibold">{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
