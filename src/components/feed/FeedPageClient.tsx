'use client';

import { useState } from 'react';
import { ExternalLink, Newspaper } from 'lucide-react';
import { useAppState } from '@/context/AppStateContext';

const tabs = ['전체', '뉴스', '콘텐츠', '팔로잉'] as const;

const feedCards = [
  { type: '뉴스', title: '반도체 장비주 장중 흐름 점검', source: 'Naver News 검색', description: '국장 주요 테마와 관련 종목 반응을 함께 확인합니다.' },
  { type: '콘텐츠', title: '오늘 장에서 알림으로 볼 만한 조건', source: 'YouTube placeholder', description: '실제 API 없이 테스트용 콘텐츠 카드로 먼저 UX를 확인합니다.' },
  { type: '팔로잉', title: '관심 테마 업데이트', source: 'Stock App', description: '팔로잉한 테마와 저장 종목 소식을 이 피드에 모으는 방향입니다.' },
];

export function FeedPageClient() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('전체');
  const { logEvent } = useAppState();
  const visible = activeTab === '전체' ? feedCards : feedCards.filter((card) => card.type === activeTab);

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-5 pb-28 pt-6">
      <header className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0B63F6] text-white shadow-lg shadow-blue-500/20">
          <Newspaper className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-3xl font-black text-slate-950">피드</h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">뉴스, 콘텐츠, 팔로잉 흐름을 모읍니다.</p>
        </div>
      </header>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab);
              logEvent('feed_tab_select', { tab });
            }}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-black ${activeTab === tab ? 'bg-slate-950 text-white' : 'bg-white text-slate-600'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {visible.map((card) => (
          <article key={card.title} className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 h-28 rounded-[22px] bg-[linear-gradient(135deg,#EAF2FF_0%,#F8FAFC_100%)]" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black text-[#0B63F6]">{card.type}</p>
                <h2 className="mt-1 text-lg font-black text-slate-950">{card.title}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{card.description}</p>
                <p className="mt-2 text-xs font-bold text-slate-400">{card.source}</p>
              </div>
              <ExternalLink className="h-5 w-5 shrink-0 text-slate-400" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
