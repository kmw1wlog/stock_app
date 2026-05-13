import Link from 'next/link';
import { ChevronRight, Database, Trophy } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { MobileShell } from '@/components/layout/MobileShell';
import { getDisplayCards, sortCards } from '@/lib/marketData';
import type { DisplayCard } from '@/lib/marketDataTypes';

export default async function RankingsPage() {
  const cards = await getDisplayCards(160);
  const categories = [
    { key: 'kr-gainers', title: '국장 상승률 TOP', basis: '전일 기준 · 공공데이터', items: sortCards(cards.filter((card) => card.market === 'KR' && (card.changePct ?? 0) > 0), 'gainer') },
    { key: 'kr-losers', title: '국장 하락률 TOP', basis: '전일 기준 · 공공데이터', items: sortCards(cards.filter((card) => card.market === 'KR' && (card.changePct ?? 0) < 0), 'loser') },
    { key: 'kr-volume', title: '국장 거래대금 TOP', basis: '전일 기준 · 공공데이터', items: sortCards(cards.filter((card) => card.market === 'KR'), 'amount') },
    { key: 'news-disclosure', title: '뉴스/공시 발생 종목', basis: 'Naver 뉴스/OpenDART/SEC EDGAR 기준', items: cards.filter((card) => card.source.includes('naver') || card.source.includes('sec') || card.source.includes('dart') || card.labels.some((label) => label.includes('뉴스') || label.includes('공시'))) },
    { key: 'chart-setup', title: '차트자리 후보', basis: '저장된 가격 라벨 기준', items: cards.filter((card) => card.chartSetupType || card.labels.some((label) => label.includes('차트자리'))) },
    { key: 'us-sec', title: '미장 SEC 이벤트', basis: 'SEC EDGAR 기준 · 가격은 TradingView 위젯', items: cards.filter((card) => card.market === 'US') },
    { key: 'crypto-gainers', title: '코인 24h 상승률 TOP', basis: '24h 기준 · Binance/Upbit public API', items: sortCards(cards.filter((card) => card.market === 'CRYPTO' && (card.changePct ?? 0) > 0), 'gainer') },
    { key: 'crypto-volume', title: '코인 거래대금 TOP', basis: '24h 기준 · Binance/Upbit public API', items: sortCards(cards.filter((card) => card.market === 'CRYPTO'), 'amount') },
  ];

  return (
    <MobileShell>
      <div className="space-y-5 py-6">
        <header className="px-5">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0B63F6] text-white shadow-lg shadow-blue-500/25"><Trophy className="h-7 w-7" /></span>
            <div>
              <h1 className="text-3xl font-black tracking-normal">랭킹</h1>
              <p className="mt-1 text-sm font-semibold text-slate-500">사용자 행동이 아니라 공식 데이터 기준으로 정렬합니다.</p>
            </div>
          </div>
        </header>
        {categories.map((category) => (
          <section key={category.key} className="mx-5 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">{category.title}</h2>
                <p className="mt-1 text-xs font-bold text-slate-500">{category.basis}</p>
              </div>
              <Badge tone="blue">live</Badge>
            </div>
            <div className="space-y-3">{category.items.length ? category.items.slice(0, 10).map((card, index) => <RankingRow key={`${category.key}-${card.id}`} card={card} index={index} />) : <EmptyState />}</div>
          </section>
        ))}
        <p className="px-6 text-xs font-semibold leading-5 text-slate-500">본 정보는 투자 판단을 돕기 위한 지표 기반 참고 정보이며, 투자 권유나 수익 보장을 의미하지 않습니다.</p>
      </div>
    </MobileShell>
  );
}

function RankingRow({ card, index }: { card: DisplayCard; index: number }) {
  return (
    <Link href={`/cards/${card.id}`} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-lg font-black text-[#0B63F6] shadow-sm">{index + 1}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-black">{card.name}</p>
        <p className="mt-1 line-clamp-1 text-xs font-bold text-slate-500">{card.dataBasisLabel}</p>
      </div>
      <span className={(card.changePct ?? 0) < 0 ? 'text-sm font-black text-blue-500' : 'text-sm font-black text-red-500'}>
        {card.changePct === undefined || card.changePct === null ? '위젯' : `${card.changePct > 0 ? '+' : ''}${card.changePct.toFixed(2)}%`}
      </span>
      <ChevronRight className="h-5 w-5 text-slate-400" />
    </Link>
  );
}

function EmptyState() {
  return <div className="rounded-2xl bg-slate-50 p-5 text-center"><Database className="mx-auto h-7 w-7 text-slate-400" /><p className="mt-2 text-sm font-bold text-slate-500">데이터 준비중</p></div>;
}
