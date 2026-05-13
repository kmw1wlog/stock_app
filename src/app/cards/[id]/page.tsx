'use client';

import { use, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, ScrollText, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { CardHero } from '@/components/card/CardHero';
import { DiagnosisGrid } from '@/components/card/DiagnosisGrid';
import { FomoSignalSection } from '@/components/card/FomoSignalSection';
import { WhyCardAppeared } from '@/components/card/WhyCardAppeared';
import { MobileShell } from '@/components/layout/MobileShell';
import { useAppState } from '@/context/AppStateContext';
import { getStockCard } from '@/data/mockStocks';

export default function CardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const card = getStockCard(id);
  const { trackCard, showToast, logEvent } = useAppState();

  useEffect(() => {
    logEvent('card_detail_view', { cardId: card.id, fomoType: card.fomoType, market: card.marketType });
  }, [card, logEvent]);

  return (
    <MobileShell>
      <div className="space-y-6 pb-6">
        <CardHero card={card} />
        <FomoSignalSection card={card} />
        <WhyCardAppeared card={card} />
        <section className="px-5">
          <h2 className="mb-3 text-xl font-black">라벨 진단</h2>
          <div className="grid grid-cols-2 gap-3">
            {card.coreLabels.concat(['뉴스 관심 증가', '커뮤니티 관심 보통', card.marketType === 'US' ? '숏 압력 보통' : card.marketType === 'CRYPTO' ? '레버리지 과열 유의' : '공매도 유의']).slice(0, 8).map((label) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-bold text-slate-500">시장 라벨</p>
                <p className="mt-1 text-base font-black text-slate-950">{label}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="px-5">
          <h2 className="mb-3 text-xl font-black">반응 구간</h2>
          <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5">
            <Badge tone="blue">{card.fomoMetric}</Badge>
            <p className="mt-3 text-lg font-black text-slate-950">{card.fomoHeadline}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{card.fomoSubtext}</p>
          </div>
        </section>
        <section className="px-5">
          <h2 className="mb-3 text-xl font-black">뉴스/공시/커뮤니티 링크</h2>
          <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4">
            <a className="block text-sm font-bold text-slate-700" href="#" onClick={(event) => event.preventDefault()}>
              뉴스 관심 증가 · 제목/키워드와 링크 중심으로 표시
            </a>
            <a className="block text-sm font-bold text-slate-700" href="#" onClick={(event) => event.preventDefault()}>
              {card.marketType === 'US' ? 'SEC 이벤트 확인' : card.marketType === 'CRYPTO' ? '거래소 공지 링크 확인' : '공시 이벤트 확인'}
            </a>
            <button
              className="text-left text-sm font-black text-[#0B63F6]"
              onClick={() => {
                logEvent('comment_view', { cardId: card.id, market: card.marketType });
                showToast('커뮤니티 반응 상세 보기 요청이 기록되었습니다.');
              }}
            >
              커뮤니티 반응 상세 보기
            </button>
          </div>
        </section>
        <DiagnosisGrid card={card} />
        <section className="grid grid-cols-3 gap-3 px-5">
          <button
            onClick={() => {
              logEvent('card_opinion_click', { cardId: card.id, source: 'detail' });
              showToast('토스증권·종목방 반응을 모아보고 있어요.');
            }}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-700"
          >
            <MessageCircle className="h-5 w-5" />
            의견 보기
          </button>
          <Link href={`/cards/${card.id}/formula`} className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-[#0B63F6] bg-white text-sm font-black text-[#0B63F6]">
            <ScrollText className="h-5 w-5" />
            조건식 복사
          </Link>
          <button onClick={() => trackCard(card.id)} className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#0B63F6] text-sm font-black text-white shadow-lg shadow-blue-500/25">
            <TrendingUp className="h-5 w-5" />
            결과 추적
          </button>
        </section>
        <p className="px-6 text-center text-xs font-semibold leading-5 text-slate-500">본 정보는 투자 판단을 돕기 위한 지표 기반 참고 정보이며, 투자 권유나 수익 보장을 의미하지 않습니다. 가격과 차트는 외부 위젯 또는 공공데이터 제공 기준이며 지연될 수 있습니다.</p>
      </div>
    </MobileShell>
  );
}
