'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Database, TrendingUp } from 'lucide-react';
import { NativeAdCard } from '@/components/ads/NativeAdCard';
import { AlertSetupModal } from '@/components/alerts/AlertSetupModal';
import { AssetChart } from '@/components/chart/AssetChart';
import { Badge } from '@/components/common/Badge';
import { HomeActionButtons } from '@/components/home/HomeActionButtons';
import { MobileShell } from '@/components/layout/MobileShell';
import { useAppState } from '@/context/AppStateContext';
import { getFormulaForCard } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';
import { APP_RELEASE_NAME, APP_VERSION } from '@/lib/version';

type FeedResponse = { mode: 'live' | 'mock'; cards?: DisplayCard[]; items?: DisplayCard[]; message?: string };
const filters = ['전체', '국장', '미장', '코인'] as const;

function percent(value?: number | null) {
  if (value === null || value === undefined) return '자료 기준';
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function compactNumber(value?: number | null) {
  if (!value) return '자료 준비중';
  return new Intl.NumberFormat('ko-KR', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

export default function HomePage() {
  const [cards, setCards] = useState<DisplayCard[]>([]);
  const [message, setMessage] = useState('데이터 준비중');
  const [mode, setMode] = useState<'live' | 'mock'>('live');
  const [filter, setFilter] = useState<(typeof filters)[number]>('전체');
  const [index, setIndex] = useState(0);
  const [alertOpen, setAlertOpen] = useState(false);
  const { saveCard, hideCard, logEvent } = useAppState();

  useEffect(() => {
    fetch('/api/cards/feed')
      .then((response) => response.json())
      .then((data: FeedResponse) => {
        const nextCards = data.cards ?? data.items ?? [];
        setCards(nextCards);
        setMode(data.mode ?? 'live');
        setMessage(data.message ?? (nextCards.length ? '' : '데이터 준비중'));
      })
      .catch(() => setMessage('데이터 준비중'));
  }, []);

  const filtered = useMemo(() => {
    if (filter === '전체') return cards;
    const market = filter === '국장' ? 'KR' : filter === '미장' ? 'US' : 'CRYPTO';
    return cards.filter((card) => card.market === market);
  }, [cards, filter]);

  const visible = filtered.length ? filtered : cards;
  const card = visible[index % Math.max(visible.length, 1)];
  const formula = card ? getFormulaForCard(card) : null;
  const nextTwo = visible.filter((item) => item.id !== card?.id).slice(0, 2);
  const moveNext = () => visible.length && setIndex((current) => (current + 1) % visible.length);

  return (
    <MobileShell>
      <div className="px-5 pt-4">
        <header className="mb-3">
          <p className="text-[11px] font-black text-[#0B63F6]">{APP_VERSION} · {APP_RELEASE_NAME}</p>
          <h1 className="mt-1 text-[24px] font-black leading-tight tracking-normal">오늘의 흐름 포착</h1>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">거래량·차트자리·뉴스 흐름이 켜진 종목을 확인하세요.</p>
          <p className="mt-1 text-[11px] font-black text-[#0B63F6]">급등주 for you</p>
          <p className="mt-1 text-[11px] font-semibold leading-4 text-slate-400">본 정보는 조건 충족 사실을 보여주는 참고 정보이며, 매수·매도 추천이 아닙니다.</p>
        </header>

        {card ? <HeroDataCard card={card} formulaShortName={formula?.shortName ?? '조건 포착'} /> : <EmptyHero message={message} />}

        <div className="mt-3">
          <HomeActionButtons
            onSkip={() => {
              if (card) hideCard(card.id, { source: 'home_condition_card', market: card.market, symbol: card.symbol });
              moveNext();
            }}
            onAlert={() => {
              if (!card || !formula) return;
              logEvent('home_alert_click', { cardKey: card.id, assetKey: card.assetKey, symbol: card.symbol, market: card.market, formulaKey: formula.key });
              setAlertOpen(true);
            }}
            onSave={() => {
              if (card) saveCard(card.id, { source: 'home_condition_card', market: card.market, symbol: card.symbol });
            }}
            onFormula={() => {
              if (!card) return;
              logEvent('home_formula_click', { cardKey: card.id, assetKey: card.assetKey, symbol: card.symbol, market: card.market });
              window.setTimeout(() => window.location.assign(`/cards/${card.id}/formula`), 0);
            }}
            onMore={() => {
              if (!card) return;
              logEvent('home_detail_click', { cardKey: card.id, assetKey: card.assetKey, symbol: card.symbol, market: card.market });
              window.setTimeout(() => window.location.assign(`/cards/${card.id}`), 0);
            }}
          />
        </div>
      </div>

      <div className="space-y-5 px-5 py-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0B63F6] text-white">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black">오늘의 흐름</h2>
              <p className="text-xs font-bold text-slate-500">DATA_MODE={mode}. live에서는 임의 가격과 임의 차트를 표시하지 않습니다.</p>
            </div>
          </div>
          <div className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
            {filters.map((item) => (
              <button key={item} onClick={() => { setFilter(item); setIndex(0); }} className={filter === item ? 'rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white' : 'rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600'}>
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4">
          <SectionTitle title="다음 판단 후보" href="/explore/movers" />
          <div className="mt-3 grid grid-cols-2 gap-3">
            {nextTwo.map((item) => <TwoUpDataCard key={item.id} card={item} />)}
            {!nextTwo.length ? <p className="col-span-2 text-sm font-semibold text-slate-500">데이터 준비중</p> : null}
          </div>
        </section>

        <NativeAdCard source="home" slotName="home_after_next_candidates" title="관심 종목을 MTS에서 확인하세요" />
        <DataSection title="오늘 급등 조건" href="/explore/movers" cards={visible.filter((item) => (item.changePct ?? 0) > 0).slice(0, 4)} />
        <DataSection title="거래대금 증가 조건" href="/rankings" cards={[...visible].sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0)).slice(0, 4)} />
        <DataSection title="뉴스·공시 조건" href="/explore/news" cards={visible.filter((item) => item.source.includes('naver') || item.source.includes('sec') || item.source.includes('dart') || item.cardType.includes('disclosure')).slice(0, 4)} />
        <NativeAdCard source="home" slotName="home_between_news_chart" title="제휴 콘텐츠" />
        <DataSection title="차트자리 조건" href="/explore/pullback" cards={visible.filter((item) => item.chartSetupType || item.labels.some((label) => label.includes('차트자리'))).slice(0, 4)} />
        <DataSection title="인기테마" href="/explore/themes" cards={visible.filter((item) => item.theme).slice(0, 4)} />
        <DataSection title="코인 24h 조건" href="/explore/maps" cards={visible.filter((item) => item.market === 'CRYPTO').slice(0, 4)} />
        <DataSection title="미장 이벤트" href="/explore/news" cards={visible.filter((item) => item.market === 'US').slice(0, 4)} />
        <NativeAdCard source="home" slotName="home_bottom_banner" title="광고 콘텐츠" />
        <p className="px-1 text-xs font-semibold leading-5 text-slate-500">본 정보는 조건 충족 사실을 보여주는 참고 정보이며, 매수·매도 추천이 아닙니다. 투자 판단은 이용자 본인에게 있습니다.</p>
      </div>
      {card && formula ? <AlertSetupModal card={card} formula={formula} open={alertOpen} onClose={() => setAlertOpen(false)} /> : null}
    </MobileShell>
  );
}

function EmptyHero({ message }: { message: string }) {
  return (
    <section className="grid min-h-[430px] place-items-center rounded-[24px] border border-slate-200 bg-white p-6 text-center shadow-sm">
      <div>
        <Database className="mx-auto h-10 w-10 text-slate-400" />
        <h2 className="mt-4 text-xl font-black">데이터 준비중</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{message}</p>
        <Link href="/data-status" className="mt-4 inline-flex rounded-2xl bg-[#0B63F6] px-4 py-3 text-sm font-black text-white">데이터 상태 보기</Link>
      </div>
    </section>
  );
}

function HeroDataCard({ card, formulaShortName }: { card: DisplayCard; formulaShortName: string }) {
  return (
    <article className="relative overflow-hidden rounded-[24px] bg-[#061A3D] text-white shadow-2xl shadow-blue-950/20">
      <Link href={`/cards/${card.id}`} className="block p-5">
        <div className="mb-2 flex flex-wrap gap-2">
          <Badge>{card.marketLabel}</Badge>
          {card.theme ? <Badge tone="gray">{card.theme}</Badge> : null}
          <Badge tone="violet">{formulaShortName}</Badge>
        </div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-3xl font-black">{card.name}</h2>
            <p className="mt-1 text-sm font-bold text-blue-100">{card.symbol}</p>
          </div>
          <div className={(card.changePct ?? 0) < 0 ? 'text-right text-2xl font-black text-blue-200' : 'text-right text-2xl font-black text-red-200'}>{percent(card.changePct)}</div>
        </div>
        <p className="mt-4 text-sm font-semibold leading-6 text-white/82">{card.primaryReason}</p>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white p-1">
          <AssetChart compact market={card.market} assetKey={card.assetKey} tvSymbol={card.tvSymbol ?? undefined} coingeckoId={card.coingeckoId ?? undefined} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <MiniStat label="현재가" value={card.price ? new Intl.NumberFormat('ko-KR').format(card.price) : '자료 준비중'} />
          <MiniStat label="거래량" value={compactNumber(card.volume)} />
          <MiniStat label="거래대금" value={compactNumber(card.amount)} />
        </div>
        <p className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-black text-blue-100">{card.dataBasisLabel}</p>
      </Link>
    </article>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-2">
      <p className="text-[10px] font-bold text-blue-100">{label}</p>
      <p className="mt-1 truncate text-xs font-black text-white">{value}</p>
    </div>
  );
}

function SectionTitle({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-lg font-black">{title}</h2>
      <Link href={href} className="flex items-center gap-1 text-sm font-black text-[#0B63F6]">
        더보기
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function TwoUpDataCard({ card }: { card: DisplayCard }) {
  return (
    <Link href={`/cards/${card.id}`} className="rounded-2xl bg-slate-50 p-3">
      <p className="truncate text-sm font-black">{card.name}</p>
      <p className={(card.changePct ?? 0) < 0 ? 'mt-1 text-lg font-black text-blue-500' : 'mt-1 text-lg font-black text-red-500'}>{percent(card.changePct)}</p>
      <p className="mt-2 line-clamp-2 text-xs font-bold leading-4 text-slate-500">{card.dataBasisLabel}</p>
    </Link>
  );
}

function DataSection({ title, href, cards }: { title: string; href: string; cards: DisplayCard[] }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4">
      <SectionTitle title={title} href={href} />
      <div className="mt-3 space-y-2">
        {cards.length ? cards.map((card) => (
          <Link key={`${title}-${card.id}`} href={`/cards/${card.id}`} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-black">{card.name}</p>
              <p className="mt-1 truncate text-xs font-bold text-slate-500">{card.primaryReason}</p>
            </div>
            <span className={(card.changePct ?? 0) < 0 ? 'text-sm font-black text-blue-500' : 'text-sm font-black text-red-500'}>{percent(card.changePct)}</span>
          </Link>
        )) : <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">데이터 준비중</p>}
      </div>
    </section>
  );
}
