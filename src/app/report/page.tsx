import Link from 'next/link';
import { BarChart3, ChevronRight, Database, FileText, PieChart } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { MobileShell } from '@/components/layout/MobileShell';
import { getDisplayCards, sortCards } from '@/lib/marketData';
import type { DisplayCard } from '@/lib/marketDataTypes';

export default async function ReportPage() {
  const cards = await getDisplayCards(160);
  const summary = {
    krCount: cards.filter((card) => card.market === 'KR').length,
    usCount: cards.filter((card) => card.market === 'US').length,
    cryptoCount: cards.filter((card) => card.market === 'CRYPTO').length,
  };
  const themes = Object.entries(
    cards.reduce<Record<string, number>>((acc, card) => {
      if (card.theme) acc[card.theme] = (acc[card.theme] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([theme, count]) => ({ theme, count }));

  return (
    <MobileShell>
      <div className="space-y-5 py-6">
        <header className="px-5">
          <h1 className="text-3xl font-black tracking-normal">리포트</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">시장 데이터 요약입니다. 사용자 행동 기반 리포트와 과금 UI는 비활성화했습니다.</p>
        </header>
        <section className="mx-5 rounded-[28px] bg-slate-950 p-5 text-white shadow-xl shadow-slate-900/20">
          <div className="mb-4 flex items-center justify-between">
            <Badge tone="blue">오늘 시장 요약</Badge>
            <BarChart3 className="h-6 w-6 text-blue-200" />
          </div>
          <h2 className="text-2xl font-black leading-tight">공식 데이터 기준 요약</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">
            {cards.length ? '공식 API, DB 저장 데이터, 공식 위젯 기준으로 구성했습니다.' : '아직 표시 가능한 live 데이터가 없습니다.'}
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <Metric label="국장" value={`${summary.krCount}`} />
            <Metric label="미장" value={`${summary.usCount}`} />
            <Metric label="코인" value={`${summary.cryptoCount}`} />
          </div>
        </section>
        <ReportSection title="국장 급등/하락" icon={<BarChart3 className="h-5 w-5" />}>
          <CardList cards={[...sortCards(cards.filter((card) => card.market === 'KR' && (card.changePct ?? 0) > 0), 'gainer').slice(0, 4), ...sortCards(cards.filter((card) => card.market === 'KR' && (card.changePct ?? 0) < 0), 'loser').slice(0, 4)]} />
        </ReportSection>
        <ReportSection title="오늘 뉴스/공시" icon={<FileText className="h-5 w-5" />}>
          <CardList cards={cards.filter((card) => card.source.includes('naver') || card.source.includes('sec') || card.source.includes('dart') || card.labels.some((label) => label.includes('뉴스') || label.includes('공시'))).slice(0, 8)} />
        </ReportSection>
        <ReportSection title="오늘 인기테마" icon={<PieChart className="h-5 w-5" />}>
          <div className="grid grid-cols-2 gap-2">
            {themes.length ? themes.map((item) => (
              <div key={item.theme} className="rounded-2xl bg-slate-50 p-3">
                <p className="text-sm font-black">{item.theme}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">데이터 카드 {item.count}개</p>
              </div>
            )) : <p className="text-sm font-bold text-slate-500">데이터 준비중</p>}
          </div>
        </ReportSection>
        <ReportSection title="미장 주요 이벤트" icon={<FileText className="h-5 w-5" />}>
          <CardList cards={cards.filter((card) => card.market === 'US').slice(0, 8)} />
        </ReportSection>
        <ReportSection title="코인 24h 요약" icon={<BarChart3 className="h-5 w-5" />}>
          <CardList cards={sortCards(cards.filter((card) => card.market === 'CRYPTO'), 'gainer').slice(0, 8)} />
        </ReportSection>
        <ReportSection title="데이터 제공 상태" icon={<Database className="h-5 w-5" />}>
          <Link href="/data-status" className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 text-sm font-black text-[#0B63F6]">
            provider 연결 상태 확인
            <ChevronRight className="h-5 w-5" />
          </Link>
        </ReportSection>
        <p className="px-6 text-xs font-semibold leading-5 text-slate-500">본 정보는 투자 판단을 돕기 위한 지표 기반 참고 정보이며, 투자 권유나 수익 보장을 의미하지 않습니다.</p>
      </div>
    </MobileShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3 text-center">
      <p className="text-xs font-bold text-slate-300">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function ReportSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mx-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-[#0B63F6]">{icon}</span>
        <h2 className="text-lg font-black">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function CardList({ cards }: { cards: DisplayCard[] }) {
  if (!cards.length) return <p className="text-sm font-bold text-slate-500">데이터 준비중</p>;
  return (
    <div className="space-y-2">
      {cards.map((card) => (
        <Link key={card.id} href={`/cards/${card.id}`} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-black">{card.name}</p>
            <p className="mt-1 line-clamp-1 text-xs font-bold text-slate-500">{card.dataBasisLabel}</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-[#0B63F6]" />
        </Link>
      ))}
    </div>
  );
}
