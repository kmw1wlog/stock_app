'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, ChevronRight, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { HomeActionButtons } from '@/components/home/HomeActionButtons';
import { SwipeCard } from '@/components/home/SwipeCard';
import { ThemeChipRow } from '@/components/home/ThemeChipRow';
import { MobileShell } from '@/components/layout/MobileShell';
import { useAppState } from '@/context/AppStateContext';
import { accumulation, afterHours, losers, marketMovers, news } from '@/data/mockExplore';
import { stockCards, type StockCard } from '@/data/mockStocks';
import { getTimeBasedCards } from '@/lib/curation/timeBasedCuration';
import type { MarketType } from '@/lib/display/displayPolicy';
import { getHomeVariant, type HomeVariant } from '@/lib/experiments/homeVariant';

const intentFilters: Record<'ALL' | MarketType, string[]> = {
  ALL: ['오늘 급등', '저장 급증', '놓친 카드', '차트자리', '조건식 인기', '테마'],
  KR: ['오늘 급등', '저장 급증', '놓친 카드', '차트자리', '조건식 인기', '기관외인', '시간외', '테마'],
  US: ['프리마켓', '저장 급증', '실적 이벤트', 'AI·반도체', '숏 압력', '차트자리', '놓친 카드'],
  CRYPTO: ['24H 급등', '거래대금', '레버리지', '펀딩비', '공포탐욕', '차트자리', '놓친 카드'],
};

const marketOptions: Array<{ label: string; value: 'ALL' | MarketType }> = [
  { label: '전체', value: 'ALL' },
  { label: '국장', value: 'KR' },
  { label: '미장', value: 'US' },
  { label: '코인', value: 'CRYPTO' },
];

const themeOptions = ['반도체', '2차전지', 'AI', '바이오', '조선', '로봇', '가상자산 관련주', 'M7', '대형코인'];

export default function HomePage() {
  const [marketFilter, setMarketFilter] = useState<'ALL' | MarketType>('ALL');
  const [intentFilter, setIntentFilter] = useState('오늘 급등');
  const [index, setIndex] = useState(0);
  const [variant, setVariant] = useState<HomeVariant>('A');
  const [showThemeSheet, setShowThemeSheet] = useState(false);
  const [showPreferenceSheet, setShowPreferenceSheet] = useState(false);
  const [scrollDepth, setScrollDepth] = useState(0);
  const router = useRouter();
  const { state, saveCard, likeCard, hideCard, setPreferredMarkets, showToast, logEvent } = useAppState();

  useEffect(() => {
    const assigned = getHomeVariant();
    setVariant(assigned);
    logEvent('home_view', { homeVariant: assigned, preferredMarkets: state.preferredMarkets });
    logEvent('home_variant_assigned', { homeVariant: assigned });
  }, [logEvent, state.preferredMarkets]);

  const curatedCards = useMemo(() => getTimeBasedCards(stockCards), []);
  const cards = useMemo(
    () =>
      curatedCards.filter((card) => {
        const marketMatched = marketFilter === 'ALL' || card.marketType === marketFilter;
        const intentMatched =
          intentFilter === '테마' ||
          card.tags.includes(intentFilter) ||
          card.fomoMetric === intentFilter ||
          card.chartSetupType.includes(intentFilter) ||
          (intentFilter === '오늘 급등' && card.priceChangeRate >= 4);
        return marketMatched && intentMatched;
      }),
    [curatedCards, intentFilter, marketFilter],
  );
  const visibleCards = cards.length ? cards : curatedCards.filter((card) => marketFilter === 'ALL' || card.marketType === marketFilter);
  const card = visibleCards[index % visibleCards.length];
  const nextCard = visibleCards[(index + 1) % visibleCards.length];

  useEffect(() => {
    if (!card) {
      return;
    }
    logEvent('hero_card_impression', cardEventPayload(card, variant, index));
    logEvent('card_impression', cardEventPayload(card, variant, index));
  }, [card, index, logEvent, variant]);

  useEffect(() => {
    if (index >= 1 && !state.preferredMarkets.length) {
      const dismissed = window.localStorage.getItem('stock-app-market-preference-dismissed');
      setShowPreferenceSheet(dismissed !== 'true');
    }
  }, [index, state.preferredMarkets.length]);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) {
        return;
      }
      const depth = Math.round((window.scrollY / max) * 100);
      const nextDepth = depth >= 75 ? 75 : depth >= 50 ? 50 : depth >= 25 ? 25 : 0;
      if (nextDepth > scrollDepth) {
        setScrollDepth(nextDepth);
        logEvent(`home_scroll_depth_${nextDepth}`, { homeVariant: variant });
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [logEvent, scrollDepth, variant]);

  const next = () => setIndex((current) => (current + 1) % visibleCards.length);
  const payload = (target: StockCard) => cardEventPayload(target, variant, index);

  const handleSkip = () => {
    logEvent('card_swipe_left', payload(card));
    hideCard(card.id, payload(card));
    next();
  };

  const handleLike = () => {
    logEvent('card_swipe_right', payload(card));
    likeCard(card.id, payload(card));
    next();
  };

  return (
    <MobileShell>
      <div className="px-5 pt-4">
        <header className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[22px] font-black leading-tight tracking-normal">오늘의 추천주 For You</h1>
            <p className="mt-1 text-xs font-semibold text-slate-500">지금 다시 포착된 후보를 넘겨봅니다.</p>
          </div>
          <button className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-blue-200 bg-white text-[#0B63F6] shadow-sm">
            <Bell className="h-5 w-5" />
          </button>
        </header>

        <SwipeCard
          card={card}
          nextCard={nextCard}
          showDeck={variant !== 'A'}
          compact={variant !== 'A'}
          index={index % visibleCards.length}
          total={visibleCards.length}
          onSwipeLeft={handleSkip}
          onSwipeRight={handleLike}
          onSwipeCancel={() => logEvent('card_swipe_cancel', payload(card))}
          onTapDetail={() => logEvent('card_tap_detail', payload(card))}
        />

        <div className="mt-3">
          <HomeActionButtons
            onSkip={handleSkip}
            onLike={() => likeCard(card.id, payload(card))}
            onSave={() => saveCard(card.id, payload(card))}
            onOpinion={() => {
              logEvent('comment_view', payload(card));
              showToast('의견 확인 요청을 기록했습니다.');
            }}
            onMore={() => {
              logEvent('card_detail_view', { ...payload(card), source: 'home_more' });
              router.push(`/cards/${card.id}`);
            }}
          />
        </div>
      </div>

      <div className="space-y-5 px-5 py-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-4">
          <SectionTitle title="다음 판단 후보" href="/explore/movers" onClick={() => logEvent('home_section_click', { source: 'next_two_cards', homeVariant: variant })} />
          <div className="mt-3 grid grid-cols-2 gap-3">
            {visibleCards.slice(index + 1, index + 3).map((item) => (
              <TwoUpStockCard key={item.id} card={item} onClick={() => logEvent('home_section_click', { source: `next_two_cards:${item.id}`, homeVariant: variant })} />
            ))}
            {visibleCards.length < 3 ? stockCards.slice(0, 2 - Math.max(0, visibleCards.length - 1)).map((item) => (
              <TwoUpStockCard key={`fallback-${item.id}`} card={item} onClick={() => logEvent('home_section_click', { source: `next_two_cards:${item.id}`, homeVariant: variant })} />
            )) : null}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0B63F6] text-white">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black">오늘의 흐름</h2>
              <p className="text-xs font-bold text-slate-500">카드 판단 뒤 필요한 필터만 조정합니다.</p>
            </div>
          </div>
          <MarketFilterRow
            active={marketFilter}
            onChange={(market) => {
              setMarketFilter(market);
              setIntentFilter(intentFilters[market][0]);
              setIndex(0);
              logEvent('market_filter_change', { filterMarket: market, homeVariant: variant });
            }}
          />
          <ThemeChipRow
            filters={intentFilters[marketFilter]}
            active={intentFilter}
            onChange={(intent) => {
              if (intent === '테마') {
                setShowThemeSheet(true);
              }
              setIntentFilter(intent);
              setIndex(0);
              logEvent('theme_filter_change', { filterMarket: marketFilter, filterIntent: intent, homeVariant: variant });
            }}
          />
        </section>

        {variant !== 'C' ? (
          <>
            <HomeSection title="오늘 급등 후보" href="/explore/movers" cards={stockCards.filter((item) => item.tags.includes('오늘 급등') || item.priceChangeRate >= 8).slice(0, 3)} onClick={(source) => logEvent('home_section_click', { source, homeVariant: variant })} />
            <HomeSection title="저장 급증 카드" href="/rankings" cards={stockCards.filter((item) => item.fomoType === 'save_spike').slice(0, 3)} onClick={(source) => logEvent('home_section_click', { source, homeVariant: variant })} />
            <HomeSection title="놓친 카드" href="/report" cards={stockCards.filter((item) => item.fomoType === 'missed_profit').slice(0, 3)} onClick={(source) => logEvent('home_section_click', { source, homeVariant: variant })} />
            <HomeSection title="차트자리 카드" href="/explore/pullback" cards={stockCards.filter((item) => item.tags.includes('차트자리')).slice(0, 3)} onClick={(source) => logEvent('home_section_click', { source, homeVariant: variant })} />
            <HomeSection title="조건식 인기 카드" href="/rankings" cards={stockCards.filter((item) => item.fomoType === 'formula_copy').slice(0, 3)} onClick={(source) => logEvent('home_section_click', { source, homeVariant: variant })} />
            <section className="rounded-3xl border border-slate-200 bg-white p-4">
              <SectionTitle title="실시간 급등 / 상승예상 / 상한가" href="/explore/movers" onClick={() => logEvent('home_section_click', { source: 'legacy_movers', homeVariant: variant })} />
              <div className="mt-3 grid grid-cols-3 gap-2">
                {marketMovers.map((item) => (
                  <Link key={item.cardId} href={`/cards/${item.cardId}`} className="rounded-2xl bg-slate-50 p-3" onClick={() => logEvent('home_section_click', { source: `legacy_movers:${item.cardId}`, homeVariant: variant })}>
                    <p className="text-xs font-black text-[#0B63F6]">{cleanLegacy(item.label, '급등')}</p>
                    <p className="mt-2 truncate text-sm font-black">{cleanLegacy(item.name, item.cardId)}</p>
                    <p className="text-sm font-black text-red-500">+{item.rate.toFixed(2)}%</p>
                    <p className="mt-1 line-clamp-2 text-[11px] font-bold leading-4 text-slate-500">{cleanLegacy(item.hint, '오늘 다시 확인할 후보')}</p>
                  </Link>
                ))}
              </div>
            </section>
            <section className="rounded-3xl border border-slate-200 bg-white p-4">
              <SectionTitle title="하락종목 / 눌림목 후보" href="/explore/pullback" onClick={() => logEvent('home_section_click', { source: 'legacy_pullback', homeVariant: variant })} />
              <div className="mt-3 grid grid-cols-3 gap-2">
                {losers.map((item) => (
                  <div key={item.label} className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-xs font-black text-slate-500">{cleanLegacy(item.label, '눌림목')}</p>
                    <p className={item.value.startsWith('-') ? 'mt-2 text-lg font-black text-blue-500' : 'mt-2 text-base font-black text-slate-950'}>{cleanLegacy(item.value, item.value)}</p>
                    <p className="mt-1 line-clamp-2 text-[11px] font-bold leading-4 text-slate-500">{cleanLegacy(item.hint, '같은 차트자리 관심 증가')}</p>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-3xl border border-slate-200 bg-white p-4">
              <SectionTitle title="기관외인매집" href="/explore/flows" onClick={() => logEvent('home_section_click', { source: 'legacy_flows', homeVariant: variant })} />
              <div className="mt-3 space-y-2">
                {accumulation.map((item) => (
                  <Link key={item.card.id} href={`/cards/${item.card.id}`} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3" onClick={() => logEvent('home_section_click', { source: `legacy_flows:${item.card.id}`, homeVariant: variant })}>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-orange-500">{cleanLegacy(item.label, '수급 TOP')}</p>
                      <p className="mt-1 truncate text-sm font-black">{item.card.name}</p>
                      <p className="mt-1 truncate text-xs font-bold text-slate-500">{cleanLegacy(item.hint, '기관·외인 수급 후보')}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </Link>
                ))}
              </div>
            </section>
          </>
        ) : null}

        <section className="rounded-3xl border border-slate-200 bg-white p-4">
          <SectionTitle title="인기테마" href="/explore/themes" onClick={() => logEvent('home_section_click', { source: 'themes', homeVariant: variant })} />
          <div className="mt-3 flex flex-wrap gap-2">
            {themeOptions.map((theme) => (
              <Badge key={theme}>{theme}</Badge>
            ))}
          </div>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-4">
          <SectionTitle title="뉴스·커뮤니티 반응" href="/explore/news" onClick={() => logEvent('home_section_click', { source: 'news', homeVariant: variant })} />
          <div className="mt-3 space-y-2">
            {news.map((item, newsIndex) => (
              <Link key={item} href="/explore/news" className="block rounded-2xl bg-slate-50 p-3 text-sm font-bold leading-5 text-slate-700" onClick={() => logEvent('home_section_click', { source: `news:${newsIndex}`, homeVariant: variant })}>
                {newsIndex + 1}. {cleanLegacy(item, ['[속보] 반도체 수출 모멘텀, 관련주 강세', '로봇 시장 성장 전망 재확인', 'AI 반도체 수요 증가 기대 확산'][newsIndex] ?? item)}
              </Link>
            ))}
          </div>
          <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">뉴스와 커뮤니티 정보는 제목 일부, 키워드, 링크, 자체 라벨 중심으로 제공합니다.</p>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-4">
          <SectionTitle title="시간외/장전 후보" href="/explore/after-hours" onClick={() => logEvent('home_section_click', { source: 'after_hours', homeVariant: variant })} />
          <div className="mt-3 space-y-2">
            {afterHours.map((item, itemIndex) => (
              <Link key={`${item.name}-${itemIndex}`} href="/explore/after-hours" className="grid grid-cols-[1fr_64px_52px] items-center rounded-2xl bg-slate-50 p-3 text-sm font-bold" onClick={() => logEvent('home_section_click', { source: `after_hours:${itemIndex}`, homeVariant: variant })}>
                <span className="truncate">{cleanLegacy(item.name, ['일진전기', '에스피시스템스', '두산'][itemIndex] ?? item.name)}</span>
                <span className={item.rate.startsWith('-') ? 'text-right text-blue-500' : 'text-right text-red-500'}>{item.rate}</span>
                <span className="text-right text-slate-400">{item.time}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {showThemeSheet ? <ThemeBottomSheet onClose={() => setShowThemeSheet(false)} onSelect={(theme) => { setIntentFilter(theme); setShowThemeSheet(false); logEvent('theme_filter_change', { filterIntent: theme, filterMarket: marketFilter, homeVariant: variant }); }} /> : null}
      {showPreferenceSheet ? <MarketPreferenceSheet onClose={() => { window.localStorage.setItem('stock-app-market-preference-dismissed', 'true'); setShowPreferenceSheet(false); }} onSave={(markets) => { setPreferredMarkets(markets); setShowPreferenceSheet(false); }} /> : null}
    </MobileShell>
  );
}

function cardEventPayload(card: StockCard, homeVariant: HomeVariant, positionIndex: number) {
  return {
    cardKey: card.id,
    market: card.marketType,
    cardType: card.fomoType,
    symbol: card.symbol,
    theme: card.theme,
    sourceLabel: card.sourceLabel,
    dataBasisLabel: card.dataBasisLabel,
    chartSetupType: card.chartSetupType,
    homeVariant,
    positionIndex,
  };
}

function MarketFilterRow({ active, onChange }: { active: 'ALL' | MarketType; onChange: (value: 'ALL' | MarketType) => void }) {
  return (
    <div className="hide-scrollbar -mx-4 mb-2 flex gap-2 overflow-x-auto px-4">
      {marketOptions.map((filter) => (
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

function HomeSection({ title, href, cards, onClick }: { title: string; href: string; cards: StockCard[]; onClick: (source: string) => void }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4">
      <SectionTitle title={title} href={href} onClick={() => onClick(title)} />
      <div className="mt-3 space-y-2">
        {cards.length ? cards.map((card) => <SmallCard key={card.id} card={card} onClick={() => onClick(`${title}:${card.id}`)} />) : <p className="text-sm font-semibold text-slate-500">데이터 준비중입니다.</p>}
      </div>
    </section>
  );
}

function TwoUpStockCard({ card, onClick }: { card: StockCard; onClick?: () => void }) {
  return (
    <Link href={`/cards/${card.id}`} onClick={onClick} className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-xs font-black text-[#0B63F6]">{card.market} · {card.theme}</p>
      <h3 className="mt-1 truncate text-base font-black">{card.name}</h3>
      <p className="mt-1 line-clamp-2 text-xs font-bold leading-4 text-slate-500">{card.chartSetupType}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className={card.priceChangeRate >= 0 ? 'text-sm font-black text-red-500' : 'text-sm font-black text-blue-500'}>
          {card.marketType === 'US' ? '위젯' : `${card.priceChangeRate > 0 ? '+' : ''}${card.priceChangeRate}%`}
        </span>
        <Badge tone="blue">{card.fomoMetric}</Badge>
      </div>
    </Link>
  );
}

function cleanLegacy(value: string | undefined, fallback: string) {
  if (!value || /[�]/.test(value) || /[媛-힣]/.test(value)) {
    return fallback;
  }
  return value;
}

function SectionTitle({ title, href, onClick }: { title: string; href: string; onClick?: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-black">{title}</h2>
      <Link href={href} onClick={onClick} className="flex items-center gap-1 text-xs font-black text-[#0B63F6]">
        더보기
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function SmallCard({ card, onClick }: { card: StockCard; onClick?: () => void }) {
  return (
    <Link href={`/cards/${card.id}`} onClick={onClick} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
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

function ThemeBottomSheet({ onClose, onSelect }: { onClose: () => void; onSelect: (theme: string) => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40" onClick={onClose}>
      <div className="absolute bottom-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 rounded-t-[28px] bg-white p-5" onClick={(event) => event.stopPropagation()}>
        <h2 className="text-xl font-black">테마 선택</h2>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {themeOptions.map((theme) => (
            <button key={theme} onClick={() => onSelect(theme)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-black text-slate-800">
              {theme}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MarketPreferenceSheet({ onClose, onSave }: { onClose: () => void; onSave: (markets: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const options = ['국장', '미장', '코인'];
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[78px] z-50 mx-auto w-full max-w-[430px] px-4 pb-3">
      <div className="pointer-events-auto rounded-[24px] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/20">
        <h2 className="text-xl font-black">주로 보고 싶은 시장을 골라주세요.</h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">복수 선택 가능, 건너뛰기 가능</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {options.map((option) => {
            const active = selected.includes(option);
            return (
              <button key={option} onClick={() => setSelected((current) => (current.includes(option) ? current.filter((item) => item !== option) : [...current, option]))} className={active ? 'rounded-2xl bg-[#0B63F6] px-4 py-3 text-sm font-black text-white' : 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-800'}>
                {option}
              </button>
            );
          })}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-600">
            건너뛰기
          </button>
          <button onClick={() => onSave(selected)} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white">
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
