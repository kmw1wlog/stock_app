'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, TrendingUp } from 'lucide-react';
import { MobileShell } from '@/components/layout/MobileShell';
import { ThemeChipRow } from '@/components/home/ThemeChipRow';
import { SwipeCard } from '@/components/home/SwipeCard';
import { HomeActionButtons } from '@/components/home/HomeActionButtons';
import { useAppState } from '@/context/AppStateContext';
import { stockCards } from '@/data/mockStocks';
import type { MarketType } from '@/lib/display/displayPolicy';

export default function HomePage() {
  const [marketFilter, setMarketFilter] = useState<'ALL' | MarketType>('ALL');
  const [activeTheme, setActiveTheme] = useState('전체');
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const { saveCard, likeCard, hideCard, showToast, logEvent } = useAppState();
  const cards = stockCards.filter((card) => {
    const marketMatched = marketFilter === 'ALL' || card.marketType === marketFilter;
    const themeMatched = activeTheme === '전체' || card.theme.includes(activeTheme) || card.tags.includes(activeTheme);
    return marketMatched && themeMatched;
  });
  const card = cards[index % cards.length];
  const secondFilters =
    marketFilter === 'US'
      ? ['전체', '급등', '프리마켓', '애프터마켓', '실적', 'AI', '반도체', 'M7']
      : marketFilter === 'CRYPTO'
        ? ['전체', '24H 급등', '거래대금', '펀딩비', '선물OI', '김프', '공포탐욕']
        : ['전체', '급등', '상한가', '시간외', '반도체', '로봇', '바이오', '기관외인'];

  useEffect(() => {
    if (card) {
      logEvent('card_impression', {
        cardId: card.id,
        market: card.marketType,
        cardType: card.fomoType,
        symbol: card.symbol,
        theme: card.theme,
        sourceLabel: card.sourceLabel,
        displayPolicy: card.dataBasisLabel,
      });
    }
  }, [card, logEvent]);

  const next = () => setIndex((current) => (current + 1) % cards.length);

  if (!card) {
    return (
      <MobileShell>
        <div className="p-5">
          <p className="text-2xl font-black">조건에 맞는 카드가 없습니다.</p>
          <button className="mt-4 rounded-2xl bg-[#0B63F6] px-4 py-3 text-sm font-black text-white" onClick={() => { setMarketFilter('ALL'); setActiveTheme('전체'); }}>
            전체 카드 보기
          </button>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="space-y-4 px-5 pt-6">
        <header className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3">
            <div className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-2xl bg-[#0B63F6] text-white shadow-lg shadow-blue-500/30">
              <TrendingUp className="h-8 w-8" strokeWidth={3} />
            </div>
            <div className="min-w-0">
              <h1 className="text-[24px] font-black leading-tight tracking-[-0.02em]">오늘의 추천주 For You</h1>
              <p className="mt-2 text-sm font-semibold leading-5 text-slate-500">남들이 오래 보고 저장하는 급등 후보를 넘겨봅니다.</p>
            </div>
          </div>
          <div className="w-[92px] shrink-0 rounded-2xl border border-blue-200 bg-white p-2 text-center shadow-sm">
            <div className="flex items-center justify-center gap-1">
              <Bell className="h-3.5 w-3.5 text-[#0B63F6]" />
              <p className="text-[11px] font-black text-slate-500">저장 후보</p>
            </div>
            <p className="text-2xl font-black text-[#0B63F6]">18</p>
          </div>
        </header>

        <div className="grid grid-cols-3 gap-2">
          <MiniStatus label="오늘 급등 후보" value="32" />
          <MiniStatus label="저장률 급상승" value="8" />
          <MiniStatus label="놓친 카드" value="6" />
        </div>
      </div>

      <div className="mt-3">
        <MarketFilterRow active={marketFilter} onChange={(market) => { setMarketFilter(market); setActiveTheme('전체'); setIndex(0); logEvent('market_filter_change', { filter: market }); }} />
        <ThemeChipRow filters={secondFilters} active={activeTheme} onChange={(theme) => { setActiveTheme(theme); setIndex(0); logEvent('market_filter_change', { market: marketFilter, filter: theme }); }} />
      </div>

      <div className="mt-3 px-5">
        <SwipeCard card={card} index={index % cards.length} total={cards.length} />
      </div>

      <div className="mt-5 px-5">
        <HomeActionButtons
          onSkip={() => { logEvent('card_skip', { cardId: card.id, market: card.marketType, cardType: card.fomoType, symbol: card.symbol, theme: card.theme, sourceLabel: card.sourceLabel }); hideCard(card.id); next(); }}
          onLike={() => { logEvent('card_like', { cardId: card.id, market: card.marketType, cardType: card.fomoType, symbol: card.symbol, theme: card.theme, sourceLabel: card.sourceLabel }); likeCard(card.id); }}
          onSave={() => { logEvent('card_save', { cardId: card.id, market: card.marketType, cardType: card.fomoType, symbol: card.symbol, theme: card.theme, sourceLabel: card.sourceLabel }); saveCard(card.id); }}
          onOpinion={() => { logEvent('card_opinion_click', { cardId: card.id }); showToast('토스증권·종목방 반응을 모아보고 있어요.'); }}
          onMore={() => { logEvent('card_detail_view', { cardId: card.id, source: 'home_more', market: card.marketType }); router.push(`/cards/${card.id}`); }}
        />
      </div>
    </MobileShell>
  );
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

function MiniStatus({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
      <p className="text-[11px] font-bold text-slate-500">{label}</p>
      <p className="mt-0.5 text-lg font-black text-[#0B63F6]">{value}</p>
    </div>
  );
}
