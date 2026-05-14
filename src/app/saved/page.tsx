'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Bookmark, ChevronRight, Copy, Database, Heart, Search, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { MobileShell } from '@/components/layout/MobileShell';
import { useAppState } from '@/context/AppStateContext';
import type { DisplayCard } from '@/lib/marketDataTypes';

const tabs = [
  { key: 'saved', label: '저장 종목', icon: Bookmark },
  { key: 'liked', label: '관심 종목', icon: Heart },
  { key: 'tracking', label: '확인 목록', icon: TrendingUp },
  { key: 'formula', label: '복사 지표식', icon: Copy },
] as const;

type TabKey = (typeof tabs)[number]['key'];

export default function SavedPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('saved');
  const [cards, setCards] = useState<DisplayCard[]>([]);
  const { state } = useAppState();

  useEffect(() => {
    fetch('/api/cards/feed')
      .then((response) => response.json())
      .then((data: { cards?: DisplayCard[]; items?: DisplayCard[] }) => setCards(data.cards ?? data.items ?? []))
      .catch(() => setCards([]));
  }, []);

  const activeIds = useMemo(() => {
    if (activeTab === 'saved') return state.savedCardIds;
    if (activeTab === 'liked') return state.likedCardIds;
    if (activeTab === 'tracking') return state.trackingCardIds;
    return state.copiedFormulaIds.map((id) => id.split('-')[0]);
  }, [activeTab, state.copiedFormulaIds, state.likedCardIds, state.savedCardIds, state.trackingCardIds]);

  const visibleCards = cards.filter((card) => activeIds.includes(card.id) || activeIds.includes(card.assetKey));

  return (
    <MobileShell>
      <div className="space-y-5 py-6">
        <header className="flex items-start justify-between px-5">
          <div>
            <h1 className="text-3xl font-black tracking-normal">보관함</h1>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">내가 저장한 종목의 현재 공식 데이터만 표시합니다.</p>
          </div>
          <Link href="/data-status" className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-[#0B63F6]" aria-label="데이터 상태">
            <Search className="h-6 w-6" />
          </Link>
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
            현재 데이터가 있는 보관 종목 <span className="text-[#0B63F6]">{visibleCards.length}개</span>
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-600">가격, 등락률, 뉴스/공시, 차트 데이터가 없으면 준비중으로 표시합니다.</p>
        </section>
        <section className="space-y-3 px-5">
          {visibleCards.length ? visibleCards.map((card) => <SavedManagementCard key={card.id} card={card} />) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center">
              <Database className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-3 text-sm font-bold text-slate-500">저장된 종목에 live 데이터가 아직 없습니다.</p>
            </div>
          )}
        </section>
      </div>
    </MobileShell>
  );
}

function SavedManagementCard({ card }: { card: DisplayCard }) {
  return (
    <Link href={`/cards/${card.id}`} className="block rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black text-[#0B63F6]">{card.marketLabel} · {card.theme ?? card.source}</p>
          <h2 className="mt-1 truncate text-xl font-black">{card.name}</h2>
          <p className="mt-1 line-clamp-1 text-sm font-semibold text-slate-500">{card.primaryReason}</p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <InfoPill label="현재가" value={card.price ? new Intl.NumberFormat('ko-KR').format(card.price) : '자료 준비중'} />
        <InfoPill label="등락률" value={card.changePct === undefined || card.changePct === null ? '위젯/자료 기준' : `${card.changePct > 0 ? '+' : ''}${card.changePct.toFixed(2)}%`} />
        <InfoPill label="출처" value={card.source} />
        <InfoPill label="기준" value={card.dataBasisLabel} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">{(card.labels.length ? card.labels : ['데이터 준비중']).slice(0, 3).map((label) => <Badge key={label} tone="gray">{label}</Badge>)}</div>
    </Link>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-slate-900">{value}</p>
    </div>
  );
}
