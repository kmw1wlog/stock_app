import Link from 'next/link';
import { ChevronLeft, Database, FileText, LineChart, ScrollText } from 'lucide-react';
import { AssetChart } from '@/components/chart/AssetChart';
import { Badge } from '@/components/common/Badge';
import { MobileShell } from '@/components/layout/MobileShell';
import { getDisplayCard } from '@/lib/marketData';
import type { DisplayCard } from '@/lib/marketDataTypes';

function percent(value?: number | null) {
  if (value === null || value === undefined) return '위젯/자료 기준';
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export default async function CardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await getDisplayCard(id);
  return (
    <MobileShell>
      <div className="space-y-6 pb-6 pt-5">
        <header className="flex items-center gap-3 px-5">
          <Link href="/" className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm"><ChevronLeft className="h-7 w-7" /></Link>
          <div><h1 className="text-2xl font-black">종목 상세</h1><p className="mt-1 text-sm font-semibold text-slate-500">공식 데이터 기준</p></div>
        </header>
        {card ? <DetailContent card={card} /> : <EmptyDetail />}
      </div>
    </MobileShell>
  );
}

function DetailContent({ card }: { card: DisplayCard }) {
  return (
    <>
      <section className="mx-5 overflow-hidden rounded-[28px] bg-[#061A3D] text-white shadow-xl shadow-blue-950/20">
        <div className="p-5">
          <div className="mb-2 flex flex-wrap gap-2"><Badge>{card.marketLabel}</Badge>{card.theme ? <Badge tone="gray">{card.theme}</Badge> : null}<Badge tone="violet">{card.source}</Badge></div>
          <h2 className="text-3xl font-black">{card.name}</h2>
          <p className="mt-2 text-sm font-semibold text-blue-100">{card.symbol}</p>
          <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-2xl border border-white/15 bg-white/12">
            <HeroStat label="현재가" value={card.price ? new Intl.NumberFormat('ko-KR').format(card.price) : '자료 준비중'} />
            <HeroStat label="등락률" value={percent(card.changePct)} />
            <HeroStat label="거래대금" value={card.amount ? new Intl.NumberFormat('ko-KR', { notation: 'compact' }).format(card.amount) : '자료 준비중'} />
          </div>
          <p className="mt-3 text-xs font-bold text-blue-100">기준: {card.dataBasisLabel}</p>
        </div>
      </section>
      <section className="px-5"><h2 className="mb-3 text-xl font-black">차트</h2><AssetChart market={card.market} assetKey={card.assetKey} tvSymbol={card.tvSymbol ?? undefined} coingeckoId={card.coingeckoId ?? undefined} /></section>
      <section className="px-5"><h2 className="mb-3 text-xl font-black">종목 진단</h2><div className="grid grid-cols-2 gap-3"><InfoBox label="시장" value={card.marketLabel} /><InfoBox label="데이터 출처" value={card.source} /><InfoBox label="데이터 기준" value={card.dataBasisLabel} /><InfoBox label="카드 유형" value={card.cardType} /></div></section>
      <section className="px-5">
        <h2 className="mb-3 text-xl font-black">차트자리</h2>
        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5">
          <Badge tone="blue">공식 데이터 기준</Badge>
          <p className="mt-3 text-lg font-black text-slate-950">{card.chartSetupType ?? '차트자리 자료 준비중'}</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">가격·거래량 데이터가 충분할 때 차트자리 라벨을 표시합니다.</p>
          <Link href="/explore/pullback" className="mt-4 inline-flex rounded-2xl bg-[#0B63F6] px-4 py-3 text-sm font-black text-white">같은 차트자리 종목 보기</Link>
        </div>
      </section>
      <section className="px-5">
        <h2 className="mb-3 text-xl font-black">왜 떴나요?</h2>
        <div className="grid gap-3">
          <Reason icon={<LineChart className="h-5 w-5" />} title="시장 데이터" items={[card.primaryReason, card.dataBasisLabel]} />
          <Reason icon={<FileText className="h-5 w-5" />} title="뉴스/공시 데이터" items={card.labels.length ? card.labels : ['뉴스·공시 자료 준비중']} />
        </div>
      </section>
      <section className="grid grid-cols-2 gap-3 px-5"><Link href={`/cards/${card.id}/formula`} className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-[#0B63F6] bg-white text-sm font-black text-[#0B63F6]"><ScrollText className="h-5 w-5" />지표식 보기</Link><Link href="/data-status" className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#0B63F6] text-sm font-black text-white shadow-lg shadow-blue-500/25"><Database className="h-5 w-5" />데이터 상태</Link></section>
      <p className="px-6 text-center text-xs font-semibold leading-5 text-slate-500">본 정보는 투자 판단을 돕기 위한 지표 기반 참고 정보이며, 투자 권유나 수익 보장을 의미하지 않습니다. 가격과 차트는 외부 위젯 또는 공식 API 제공 기준이며 지연될 수 있습니다.</p>
    </>
  );
}

function EmptyDetail() {
  return <div className="mx-5 rounded-3xl border border-slate-200 bg-white p-6 text-center"><Database className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 text-sm font-bold text-slate-500">데이터 준비중</p></div>;
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return <div className="border-r border-white/15 p-3 last:border-r-0"><p className="text-[10px] text-blue-100">{label}</p><p className="mt-1 text-sm font-black">{value}</p></div>;
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-1 text-sm font-black text-slate-900">{value}</p></div>;
}

function Reason({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-3 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-[#0B63F6]">{icon}</span><h3 className="text-lg font-black">{title}</h3></div><ul className="space-y-2 text-sm font-semibold leading-6 text-slate-600">{items.map((item) => <li key={item}>· {item}</li>)}</ul></div>;
}
