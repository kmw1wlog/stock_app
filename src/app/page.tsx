'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, ChevronRight, TrendingUp } from 'lucide-react';
import { MobileShell } from '@/components/layout/MobileShell';
import { ThemeChipRow } from '@/components/home/ThemeChipRow';
import { SwipeCard } from '@/components/home/SwipeCard';
import { HomeActionButtons } from '@/components/home/HomeActionButtons';
import { Badge } from '@/components/common/Badge';
import { useAppState } from '@/context/AppStateContext';
import { stockCards, type StockCard } from '@/data/mockStocks';
import type { MarketType } from '@/lib/display/displayPolicy';

const intentFilters: Record<'ALL' | MarketType, string[]> = {
  ALL: ['오늘 급등', '저장 급증', '놓친 카드', '차트자리', '조건식 인기', '테마'],
  KR: ['오늘 급등', '저장 급증', '놓친 카드', '차트자리', '조건식 인기', '기관외인', '시간외', '테마'],
  US: ['프리마켓', '저장 급증', '실적 이벤트', 'AI·반도체', '숏 압력', '차트자리', '놓친 카드'],
  CRYPTO: ['24H 급등', '거래대금', '레버리지', '펀딩비', '공포탐욕', '차트자리', '놓친 카드'],
};

export default function HomePage() {
  const [marketFilter, setMarketFilter] = useState<'ALL' | MarketType>('ALL');
  const [intentFilter, setIntentFilter] = useState('오늘 급등');
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const { saveCard, likeCard, hideCard, showToast, logEvent } = useAppState();

  const cards = useMemo(
    () =>
      stockCards.filter((card) => {
        const marketMatched = marketFilter === 'ALL' || card.marketType === marketFilter;
        const intentMatched = intentFilter === '테마' || card.tags.includes(intentFilter) || card.fomoMetric === intentFilter || card.chartSetupType.includes(intentFilter);
        return marketMatched && (intentMatched || intentFilter === '오늘 급등');
      }),
    [intentFilter, marketFilter],
  );
  const visibleCards = cards.length ? cards : stockCards.filter((card) => marketFilter === 'ALL' || card.marketType === marketFilter);
  const card = visibleCards[index % visibleCards.length];

  useEffect(() => {
    if (card) {
      logEvent('card_impression', {
        cardKey: card.id,
        market: card.marketType,
        cardType: card.fomoType,
        symbol: card.symbol,
        theme: card.theme,
        sourceLabel: card.sourceLabel,
        dataBasisLabel: card.dataBasisLabel,
        chartSetupType: card.chartSetupType,
        filterMarket: marketFilter,
        filterIntent: intentFilter,
      });
    }
  }, [card, intentFilter, logEvent, marketFilter]);

  const next = () => setIndex((current) => (current + 1) % visibleCards.length);

  return (
    <MobileShell>
      <div className="space-y-4 px-5 pt-6">
        <header className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3">
            <div className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-2xl bg-[#0B63F6] text-white shadow-lg shadow-blue-500/30">
              <TrendingUp className="h-8 w-8" strokeWidth={3} />
            </div>
            <div className="min-w-0">
              <h1 className="text-[24px] font-black leading-tight tracking-normal">오늘의 급등 후보</h1>
              <p className="mt-2 text-sm font-semibold leading-5 text-slate-500">진단, 차트자리, 놓친 카드, 조건식 반응을 한 번에 봅니다.</p>
            </div>
          </div>
          <div className="w-[92px] shrink-0 rounded-2xl border border-blue-200 bg-white p-2 text-center shadow-sm">
            <div className="flex items-center justify-center gap-1">
              <Bell className="h-3.5 w-3.5 text-[#0B63F6]" />
              <p className="text-[11px] font-black text-slate-500">재확인</p>
            </div>
            <p className="text-2xl font-black text-[#0B63F6]">18</p>
          </div>
        </header>

        <div className="grid grid-cols-3 gap-2">
          <MiniStatus label="오늘 급등 후보" value="32" />
          <MiniStatus label="저장 급증" value="8" />
          <MiniStatus label="놓친 카드" value="6" />
        </div>
      </div>

      <div className="mt-3">
        <MarketFilterRow
          active={marketFilter}
          onChange={(market) => {
            setMarketFilter(market);
            setIntentFilter(intentFilters[market][0]);
            setIndex(0);
            logEvent('market_filter_change', { filterMarket: market });
          }}
        />
        <ThemeChipRow
          filters={intentFilters[marketFilter]}
          active={intentFilter}
          onChange={(intent) => {
            setIntentFilter(intent);
            setIndex(0);
            logEvent('theme_filter_change', { filterMarket: marketFilter, filterIntent: intent });
          }}
        />
      </div>

      <div className="mt-3 px-5">
        <SwipeCard card={card} index={index % visibleCards.length} total={visibleCards.length} />
      </div>

      <div className="mt-5 px-5">
        <HomeActionButtons
          onSkip={() => {
            hideCard(card.id, cardEventPayload(card));
            next();
          }}
          onLike={() => likeCard(card.id, cardEventPayload(card))}
          onSave={() => saveCard(card.id, cardEventPayload(card))}
          onOpinion={() => {
            logEvent('comment_view', { cardKey: card.id, market: card.marketType });
            showToast('의견 확인 요청을 기록했습니다.');
          }}
          onMore={() => {
            logEvent('card_detail_view', { cardKey: card.id, source: 'home_more', market: card.marketType });
            router.push(`/cards/${card.id}`);
          }}
        />
      </div>

      <div className="space-y-5 px-5 py-6">
        <HomeSection title="오늘 급등 후보" href="/explore/movers" cards={stockCards.filter((item) => item.tags.includes('오늘 급등')).slice(0, 3)} />
        <HomeSection title="저장 급증 카드" href="/explore/movers" cards={stockCards.filter((item) => item.fomoType === 'save_spike').slice(0, 3)} />
        <HomeSection title="놓친 카드" href="/results" cards={stockCards.filter((item) => item.fomoType === 'missed_profit').slice(0, 3)} />
        <HomeSection title="차트자리 카드" href="/explore/pullback" cards={stockCards.filter((item) => item.tags.includes('차트자리')).slice(0, 3)} />
        <HomeSection title="조건식 인기 카드" href="/explore/flows" cards={stockCards.filter((item) => item.fomoType === 'formula_copy').slice(0, 3)} />
        <section className="rounded-3xl border border-slate-200 bg-white p-4">
          <SectionTitle title="인기테마" href="/explore/themes" />
          <div className="mt-3 flex flex-wrap gap-2">
            {['반도체', '로봇', '바이오', 'AI', '2차전지', 'M7', '대형코인'].map((theme) => (
              <Badge key={theme}>{theme}</Badge>
            ))}
          </div>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-4">
          <SectionTitle title="뉴스·커뮤니티 반응" href="/explore/news" />
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">뉴스와 커뮤니티 정보는 제목 일부, 키워드, 링크, 자체 라벨 중심으로 제공합니다.</p>
        </section>
        <HomeSection title="시간외/장전 후보" href="/explore/after-hours" cards={stockCards.filter((item) => item.tags.includes('시간외') || item.tags.includes('프리마켓')).slice(0, 3)} />
      </div>
    </MobileShell>
  );
}

function cardEventPayload(card: StockCard) {
  return {
    cardKey: card.id,
    market: card.marketType,
    cardType: card.fomoType,
    symbol: card.symbol,
    theme: card.theme,
    sourceLabel: card.sourceLabel,
    dataBasisLabel: card.dataBasisLabel,
    chartSetupType: card.chartSetupType,
  };
}

function MarketFilterRow({ active, onChange }: { active: 'ALL' | MarketType; onChange: (value: 'ALL' | MarketType) => void }) {
  const filters: Array<{ label: string; value: 'ALL' | MarketType }> = [
    { label: '전체', value: 'ALL' },
    { label: '국장', value: 'KR' },
    { label: '미장', value: 'US' },
    { label: '코인', value: 'CRYPTO' },
  ];
  return (
    <div className="hide-scrollbar -mx-5 mb-2 flex gap-2 overflow-x-auto px-5">
      {filters.map((filter) => (
        <button
          key={filter.value}
          className={active === filter.value ? 'rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white' : 'rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600'}
          onClick={() => onChange(filter.value)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

function HomeSection({ title, href, cards }: { title: string; href: string; cards: StockCard[] }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4">
      <SectionTitle title={title} href={href} />
      <div className="mt-3 space-y-2">
        {cards.length ? cards.map((card) => <SmallCard key={card.id} card={card} />) : <p className="text-sm font-semibold text-slate-500">데이터 준비중입니다.</p>}
      </div>
    </section>
  );
}

function SectionTitle({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-black">{title}</h2>
      <Link href={href} className="flex items-center gap-1 text-xs font-black text-[#0B63F6]">
        더보기
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function SmallCard({ card }: { card: StockCard }) {
  return (
    <Link href={`/cards/${card.id}`} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-black">{card.name}</p>
        <p className="mt-1 truncate text-xs font-bold text-slate-500">{card.chartSetupType}</p>
      </div>
      <span className={card.priceChangeRate >= 0 ? 'text-sm font-black text-red-500' : 'text-sm font-black text-blue-500'}>
        {card.marketType === 'US' ? '위젯' : `${card.priceChangeRate > 0 ? '+' : ''}${card.priceChangeRate}%`}
      </span>
    </Link>
  );
}

function MiniStatus({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
      <p className="text-[11px] font-bold text-slate-500">{label}</p>
      <p className="mt-0.5 text-lg font-black text-[#0B63F6]">{value}</p>
    </div>
  );
}
