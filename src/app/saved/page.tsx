'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Bookmark, ChevronRight, Copy, Eye, Filter, Heart, RotateCcw, Search, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { PremiumLockCard } from '@/components/common/PremiumLockCard';
import { MobileShell } from '@/components/layout/MobileShell';
import { useAppState } from '@/context/AppStateContext';
import { getStockCard, stockCards, type StockCard } from '@/data/mockStocks';

const tabs = [
  { key: 'saved', label: '저장 카드', icon: Bookmark },
  { key: 'liked', label: '관심 종목', icon: Heart },
  { key: 'tracking', label: '결과 추적', icon: TrendingUp },
  { key: 'formula', label: '복사 조건식', icon: Copy },
  { key: 'rediscovered', label: '다시 포착됨', icon: RotateCcw },
] as const;

type TabKey = (typeof tabs)[number]['key'];

export default function SavedPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('saved');
  const { state, showToast, logEvent } = useAppState();

  useEffect(() => {
    logEvent('saved_tab_view', { tab: activeTab });
  }, [activeTab, logEvent]);

  const cards = getCardsForTab(activeTab, state);

  return (
    <MobileShell>
      <div className="space-y-5 py-6">
        <header className="flex items-start justify-between px-5">
          <div>
            <h1 className="text-3xl font-black tracking-normal">보관함</h1>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">저장한 카드와 다시 봐야 할 후보를 관리합니다.</p>
          </div>
          <div className="flex gap-3">
            <button className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 bg-white">
              <Filter className="h-6 w-6" />
            </button>
            <button className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-[#0B63F6]">
              <Search className="h-6 w-6" />
            </button>
          </div>
        </header>

        <div className="hide-scrollbar flex gap-2 overflow-x-auto px-5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={activeTab === tab.key ? 'flex shrink-0 items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white' : 'flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600'}>
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <section className="mx-5 rounded-3xl border border-blue-200 bg-blue-50 p-5">
          <p className="text-xl font-black">
            오늘 다시 확인할 후보 <span className="text-[#0B63F6]">{cards.length}개</span>
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-600">저장 당시보다 거래량 라벨이 강해졌거나 같은 차트자리가 다시 포착된 카드입니다.</p>
        </section>

        <section className="space-y-3 px-5">
          {cards.map((card) => <SavedManagementCard key={card.id} card={card} />)}
        </section>

        <button
          onClick={() => {
            logEvent('missed_card_click', { source: 'saved_bottom_banner' });
            showToast('놓친 카드 다시 보기 요청을 기록했습니다.');
          }}
          className="mx-5 flex w-[calc(100%-40px)] flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-left text-base font-black text-[#0B63F6]"
        >
          <span>저장 후 다시 같은 차트자리가 포착됐습니다.</span>
          <span className="text-sm font-semibold text-slate-600">조건식까지 확인한 사용자가 늘어난 카드도 함께 확인하세요.</span>
          <span className="self-end rounded-xl bg-[#0B63F6] px-4 py-3 text-sm text-white">다시 포착됨 보기</span>
        </button>

        <div className="px-5">
          <PremiumLockCard source="saved_rediscovered" feature="rediscovered_cards" title="보관함 다시 포착됨 전체 보기" description="저장 카드의 차트자리 재포착, 새 뉴스/공시, 조건식 확인 증가 카드를 전체로 봅니다." />
        </div>
      </div>
    </MobileShell>
  );
}

function getCardsForTab(activeTab: TabKey, state: ReturnType<typeof useAppState>['state']) {
  if (activeTab === 'saved') {
    return state.savedCardIds.length ? state.savedCardIds.map(getStockCard) : stockCards.slice(0, 3);
  }
  if (activeTab === 'liked') {
    return state.likedCardIds.length ? state.likedCardIds.map(getStockCard) : stockCards.filter((card) => card.saveTrend === '급증').slice(0, 3);
  }
  if (activeTab === 'tracking') {
    return state.trackingCardIds.length ? state.trackingCardIds.map(getStockCard) : stockCards.filter((card) => card.fomoType === 'missed_profit').slice(0, 3);
  }
  if (activeTab === 'formula') {
    return stockCards.filter((card) => card.fomoType === 'formula_copy' || state.copiedFormulaIds.some((id) => id.startsWith(card.id))).slice(0, 4);
  }
  return stockCards.filter((card) => card.tags.includes('차트자리') || card.fomoType === 'missed_profit').slice(0, 4);
}

function SavedManagementCard({ card }: { card: StockCard }) {
  return (
    <Link href={`/cards/${card.id}`} className="block rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black text-[#0B63F6]">{card.market} · {card.theme}</p>
          <h2 className="mt-1 truncate text-xl font-black">{card.name}</h2>
          <p className="mt-1 line-clamp-1 text-sm font-semibold text-slate-500">{card.chartSetupType}</p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <InfoPill icon={<Bookmark className="h-4 w-4" />} label="저장 당시 라벨" value={card.coreLabels[0]} />
        <InfoPill icon={<Eye className="h-4 w-4" />} label="현재 라벨" value="거래량 관심 증가" />
        <InfoPill icon={<TrendingUp className="h-4 w-4" />} label="저장 후 변화" value={card.marketType === 'US' ? '위젯 기준 확인' : `${card.priceChangeRate > 0 ? '+' : ''}${card.priceChangeRate}%`} />
        <InfoPill icon={<RotateCcw className="h-4 w-4" />} label="재포착" value="같은 차트자리" />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge tone="green">조건식 확인 여부</Badge>
        <Badge tone="blue">결과추적 등록 가능</Badge>
        <Badge tone="gray">뉴스/공시 새 라벨 확인</Badge>
      </div>
    </Link>
  );
}

function InfoPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
        {icon}
        {label}
      </div>
      <p className="mt-1 truncate text-sm font-black text-slate-900">{value}</p>
    </div>
  );
}
