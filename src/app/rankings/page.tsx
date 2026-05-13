'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronRight, Trophy } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { PremiumLockCard } from '@/components/common/PremiumLockCard';
import { MobileShell } from '@/components/layout/MobileShell';
import { useAppState } from '@/context/AppStateContext';
import { getRankingCategories } from '@/lib/rankings/rankingData';

export default function RankingsPage() {
  const categories = getRankingCategories();
  const [activeKey, setActiveKey] = useState(categories[0].key);
  const { logEvent } = useAppState();
  const active = categories.find((category) => category.key === activeKey) ?? categories[0];

  useEffect(() => {
    logEvent('ranking_tab_view');
  }, [logEvent]);

  return (
    <MobileShell>
      <div className="space-y-5 py-6">
        <header className="px-5">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0B63F6] text-white shadow-lg shadow-blue-500/25">
              <Trophy className="h-7 w-7" />
            </span>
            <div>
              <h1 className="text-3xl font-black tracking-normal">랭킹</h1>
              <p className="mt-1 text-sm font-semibold text-slate-500">남들이 저장하고 조건식까지 본 카드를 먼저 봅니다.</p>
            </div>
          </div>
        </header>

        <div className="hide-scrollbar flex gap-2 overflow-x-auto px-5">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => {
                setActiveKey(category.key);
                logEvent('ranking_category_click', { ranking_category: category.key });
              }}
              className={activeKey === category.key ? 'shrink-0 rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white' : 'shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600'}
            >
              {category.title}
            </button>
          ))}
        </div>

        <section className="mx-5 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">{active.title}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">{active.description}</p>
            </div>
            <Badge tone="blue">무료 TOP 3</Badge>
          </div>
          <div className="space-y-3">
            {active.cards.slice(0, 3).map((card, index) => (
              <Link
                key={card.id}
                href={`/cards/${card.id}`}
                onClick={() => logEvent('ranking_card_click', { ranking_category: active.key, cardKey: card.id, symbol: card.symbol, market: card.marketType, chartSetupType: card.chartSetupType })}
                className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-lg font-black text-[#0B63F6] shadow-sm">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-black">{card.name}</p>
                  <p className="mt-1 line-clamp-1 text-xs font-bold text-slate-500">{card.chartSetupType}</p>
                </div>
                <span className={card.priceChangeRate >= 0 ? 'text-sm font-black text-red-500' : 'text-sm font-black text-blue-500'}>
                  {card.marketType === 'US' ? '위젯' : `${card.priceChangeRate > 0 ? '+' : ''}${card.priceChangeRate}%`}
                </span>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </Link>
            ))}
          </div>
        </section>

        <div className="px-5">
          <PremiumLockCard
            source={`ranking_${active.key}`}
            feature={active.key}
            title={active.premiumTitle}
            description="TOP 30, 시장별·테마별·차트자리별 랭킹과 장전/장후 알림 연결을 확인합니다."
          />
        </div>

        <section className="mx-5 rounded-3xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-black">랭킹 기준</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
            저장, 조건식 확인, 차트자리 재등장, 놓친 카드 재확인 이벤트를 기준으로 정렬합니다. 본 정보는 투자 판단을 돕기 위한 참고 정보이며 투자 권유가 아닙니다.
          </p>
        </section>
      </div>
    </MobileShell>
  );
}
