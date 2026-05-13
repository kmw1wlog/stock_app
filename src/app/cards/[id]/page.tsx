'use client';

import { use, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, Repeat2, ScrollText, TrendingUp } from 'lucide-react';
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
    logEvent('card_detail_view', {
      cardKey: card.id,
      cardType: card.fomoType,
      market: card.marketType,
      symbol: card.symbol,
      theme: card.theme,
      chartSetupType: card.chartSetupType,
      dataBasisLabel: card.dataBasisLabel,
      sourceLabel: card.sourceLabel,
    });
  }, [card, logEvent]);

  return (
    <MobileShell>
      <div className="space-y-6 pb-6">
        <CardHero card={card} />
        <DiagnosisGrid card={card} />
        <section className="px-5">
          <h2 className="mb-3 text-xl font-black">차트자리</h2>
          <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5">
            <Badge tone="blue">동일 차트자리 유형</Badge>
            <p className="mt-3 text-lg font-black text-slate-950">{card.chartSetupType}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{card.chartSetupDescription}</p>
            <p className="mt-2 text-xs font-bold text-slate-500">동일 차트자리 유형에 해당하는 종목입니다.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-3 text-sm font-black text-[#0B63F6]"
                onClick={() => {
                  logEvent('chart_seat_related_cards_click', { cardKey: card.id, market: card.marketType, chartSetupType: card.chartSetupType });
                  showToast('같은 차트자리 종목 보기 요청을 기록했습니다.');
                }}
              >
                <Repeat2 className="h-5 w-5" />
                같은 차트자리 종목 보기
              </button>
              <Link
                href={`/cards/${card.id}/formula`}
                className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#0B63F6] px-3 text-sm font-black text-white"
                onClick={() => logEvent('chart_seat_formula_view', { cardKey: card.id, market: card.marketType, chartSetupType: card.chartSetupType })}
              >
                <ScrollText className="h-5 w-5" />
                이 차트자리 조건식 보기
              </Link>
            </div>
          </div>
        </section>
        <WhyCardAppeared card={card} />
        <FomoSignalSection card={card} />
        <section className="px-5">
          <h2 className="mb-3 text-xl font-black">뉴스·공시·커뮤니티 링크</h2>
          <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4">
            <a className="block text-sm font-bold text-slate-700" href="#" onClick={(event) => event.preventDefault()}>
              뉴스와 커뮤니티 정보는 제목 일부, 키워드, 링크, 자체 라벨 중심으로 제공합니다.
            </a>
            <a className="block text-sm font-bold text-slate-700" href="#" onClick={(event) => event.preventDefault()}>
              {card.marketType === 'US' ? 'SEC 이벤트 확인' : card.marketType === 'CRYPTO' ? '거래소 공지 링크 확인' : '공시 이벤트 확인'}
            </a>
            <button
              className="text-left text-sm font-black text-[#0B63F6]"
              onClick={() => {
                logEvent('comment_view', { cardKey: card.id, market: card.marketType });
                showToast('의견 확인 요청을 기록했습니다.');
              }}
            >
              의견 확인하기
            </button>
          </div>
        </section>
        <section className="grid grid-cols-3 gap-3 px-5">
          <button
            onClick={() => {
              logEvent('comment_view', { cardKey: card.id, source: 'detail_cta' });
              showToast('의견 확인 요청을 기록했습니다.');
            }}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-700"
          >
            <MessageCircle className="h-5 w-5" />
            의견
          </button>
          <Link href={`/cards/${card.id}/formula`} className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-[#0B63F6] bg-white text-sm font-black text-[#0B63F6]">
            <ScrollText className="h-5 w-5" />
            조건식
          </Link>
          <button onClick={() => trackCard(card.id, { market: card.marketType, symbol: card.symbol, chartSetupType: card.chartSetupType })} className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#0B63F6] text-sm font-black text-white shadow-lg shadow-blue-500/25">
            <TrendingUp className="h-5 w-5" />
            결과 추적
          </button>
        </section>
        <p className="px-6 text-center text-xs font-semibold leading-5 text-slate-500">
          본 정보는 투자 판단을 돕기 위한 지표 기반 참고 정보이며, 투자 권유나 수익 보장을 의미하지 않습니다. 가격과 차트는 외부 위젯 또는 공공데이터 제공 기준이며 지연될 수 있습니다.
        </p>
      </div>
    </MobileShell>
  );
}
