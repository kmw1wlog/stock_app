'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { BarChart3, ChevronRight, PieChart, RotateCcw, Target } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { PremiumLockCard } from '@/components/common/PremiumLockCard';
import { MobileShell } from '@/components/layout/MobileShell';
import { ResultTrackingCard } from '@/components/results/ResultTrackingCard';
import { useAppState } from '@/context/AppStateContext';
import { getReportData } from '@/lib/report/reportData';

export default function ReportPage() {
  const { logEvent, state } = useAppState();
  const report = getReportData();

  useEffect(() => {
    logEvent('report_view', { preferredMarkets: state.preferredMarkets });
  }, [logEvent, state.preferredMarkets]);

  return (
    <MobileShell>
      <div className="space-y-5 py-6">
        <header className="px-5">
          <h1 className="text-3xl font-black tracking-normal">리포트</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">저장하거나 넘긴 카드가 이후 어떻게 다시 확인됐는지 봅니다.</p>
        </header>

        <section className="mx-5 rounded-[28px] bg-slate-950 p-5 text-white shadow-xl shadow-slate-900/20">
          <div className="mb-4 flex items-center justify-between">
            <Badge tone="blue">이번 주 요약</Badge>
            <BarChart3 className="h-6 w-6 text-blue-200" />
          </div>
          <h2 className="text-2xl font-black leading-tight">{report.summary.headline}</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">{report.summary.description}</p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <Metric label="놓친 카드" value={`${report.summary.missedCount}`} />
            <Metric label="재포착" value={`${report.summary.rediscoveredCount}`} />
            <Metric label="결과추적" value={`${report.summary.trackedCount}`} />
          </div>
        </section>

        <ReportSection title="오늘 내가 본 종목" icon={<Target className="h-5 w-5" />}>
          <div className="space-y-2">
            {report.viewedCards.map((card) => <CompactCard key={card.id} cardId={card.id} name={card.name} meta={`${card.market} · ${card.chartSetupType}`} />)}
          </div>
        </ReportSection>

        <ReportSection title="저장한 종목의 이후 움직임" icon={<BarChart3 className="h-5 w-5" />}>
          <div className="space-y-3">
            {report.savedCards.map(({ card, result }) => <ResultTrackingCard key={card.id} card={card} result={result} />)}
          </div>
        </ReportSection>

        <ReportSection title="놓친 카드" icon={<RotateCcw className="h-5 w-5" />}>
          <div className="space-y-2">
            {report.missedCards.map((card) => (
              <CompactCard key={card.id} cardId={card.id} name={card.name} meta="저장하지 않고 넘긴 카드가 다시 차트자리 신호를 보였습니다." accent="text-red-500" />
            ))}
          </div>
          <PremiumLockCard source="report_missed_cards" feature="missed_cards" title="놓친 급등 카드 전체 보기" description="이번 주 놓친 급등 카드와 장전 포착 후 급등한 카드 전체를 확인합니다." className="mt-3" />
        </ReportSection>

        <ReportSection title="오늘 많이 포착된 테마" icon={<PieChart className="h-5 w-5" />}>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(report.themeCounts).map(([theme, count]) => (
              <div key={theme} className="rounded-2xl bg-slate-50 p-3">
                <p className="text-sm font-black">{theme}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">카드 {count}개 · 저장 증가</p>
              </div>
            ))}
          </div>
        </ReportSection>

        <ReportSection title="내가 관심 가진 시장 비중" icon={<PieChart className="h-5 w-5" />}>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(report.marketCounts).map(([market, count]) => (
              <Metric key={market} label={market} value={`${count}`} light />
            ))}
          </div>
        </ReportSection>

        <ReportSection title="내일 다시 볼 만한 종목" icon={<Target className="h-5 w-5" />}>
          <div className="space-y-2">
            {report.tomorrowCards.map((card) => <CompactCard key={card.id} cardId={card.id} name={card.name} meta={`${card.fomoMetric} · ${card.dataBasisLabel}`} />)}
          </div>
        </ReportSection>

        <ReportSection title="최근 자주 등장한 차트자리" icon={<RotateCcw className="h-5 w-5" />}>
          <div className="space-y-2">
            {report.chartSetups.map((setup, index) => (
              <div key={setup} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                <p className="text-sm font-black">{setup}</p>
                <span className="text-xs font-black text-[#0B63F6]">#{index + 1}</span>
              </div>
            ))}
          </div>
        </ReportSection>

        <p className="px-6 text-xs font-semibold leading-5 text-slate-500">
          가상추적 결과는 기준 시점 이후 가격 변화를 단순 계산한 참고 정보입니다. 실제 체결, 수수료, 슬리피지에 따라 달라질 수 있습니다.
        </p>
      </div>
    </MobileShell>
  );
}

function Metric({ label, value, light }: { label: string; value: string; light?: boolean }) {
  return (
    <div className={light ? 'rounded-2xl bg-slate-50 p-3 text-center' : 'rounded-2xl bg-white/10 p-3 text-center'}>
      <p className={light ? 'text-xs font-bold text-slate-500' : 'text-xs font-bold text-slate-300'}>{label}</p>
      <p className={light ? 'mt-1 text-2xl font-black text-[#0B63F6]' : 'mt-1 text-2xl font-black text-white'}>{value}</p>
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

function CompactCard({ cardId, name, meta, accent = 'text-[#0B63F6]' }: { cardId: string; name: string; meta: string; accent?: string }) {
  return (
    <Link href={`/cards/${cardId}`} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-black">{name}</p>
        <p className="mt-1 line-clamp-1 text-xs font-bold text-slate-500">{meta}</p>
      </div>
      <ChevronRight className={`h-5 w-5 shrink-0 ${accent}`} />
    </Link>
  );
}
