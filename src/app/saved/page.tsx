'use client';

import { Filter, Search, Users } from 'lucide-react';
import { PremiumLockCard } from '@/components/common/PremiumLockCard';
import { MobileShell } from '@/components/layout/MobileShell';
import { SavedCardItem } from '@/components/saved/SavedCardItem';
import { useAppState } from '@/context/AppStateContext';
import { getStockCard, stockCards } from '@/data/mockStocks';

export default function SavedPage() {
  const { state, showToast, logEvent } = useAppState();
  const savedCards = state.savedCardIds.length ? state.savedCardIds.map(getStockCard) : stockCards.slice(0, 3);
  const likedCards = state.likedCardIds.map(getStockCard);
  const copied = state.copiedFormulaIds.length;

  return (
    <MobileShell>
      <div className="space-y-5 py-6">
        <header className="flex items-start justify-between px-5">
          <div>
            <h1 className="text-4xl font-black tracking-[-0.03em]">보관함</h1>
            <p className="mt-2 text-sm font-semibold text-slate-500">저장한 카드와 놓친 기회를 한눈에 확인하세요.</p>
          </div>
          <div className="flex gap-3">
            <button className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 bg-white">
              <Filter className="h-6 w-6" />
            </button>
            <button className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-[#0B63F6]">
              <Users className="h-7 w-7" />
            </button>
          </div>
        </header>
        <div className="mx-5 grid grid-cols-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <button className="bg-[#0B63F6] py-4 text-sm font-black text-white">저장 카드</button>
          <button className="py-4 text-sm font-black text-slate-500">관심 종목 {likedCards.length}</button>
          <button className="py-4 text-sm font-black text-slate-500">복사 조건식 {copied}</button>
        </div>
        <section className="mx-5 flex items-center justify-between rounded-3xl border border-blue-200 bg-blue-50 p-5">
          <div>
            <p className="text-xl font-black">이번 주 저장한 카드 <span className="text-[#0B63F6]">7개</span></p>
            <p className="mt-1 text-sm font-semibold text-slate-600">저장한 카드 중 3개가 수익권에 진입했습니다.</p>
          </div>
          <Search className="h-10 w-10 text-[#0B63F6]" />
        </section>
        <section className="space-y-3 px-5">
          {savedCards.map((card, index) => (
            <SavedCardItem key={card.id} card={card} status={index === 0 ? '저장됨' : index === 1 ? '관심' : '관찰 중'} />
          ))}
        </section>
        <button
          onClick={() => {
            logEvent('saved_missed_card_click', { source: 'saved_bottom_banner' });
            showToast('놓친 카드 다시 보기 요청이 기록되었습니다.');
          }}
          className="mx-5 flex w-[calc(100%-40px)] flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-left text-base font-black text-[#0B63F6]"
        >
          <span>3일 전 넘긴 카드가 다시 뜨고 있어요</span>
          <span className="text-sm font-semibold text-slate-600">장중 최고 +6.8%까지 반응한 카드입니다.</span>
          <span className="self-end rounded-xl bg-[#0B63F6] px-4 py-3 text-sm text-white">놓친 카드 다시 보기</span>
        </button>
        <div className="px-5">
          <PremiumLockCard source="saved_bottom" />
        </div>
      </div>
    </MobileShell>
  );
}
