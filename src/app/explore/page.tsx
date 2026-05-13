import Link from 'next/link';
import { Bell, ChevronRight, Clock, Flame, Grid3X3, Newspaper, Search, Shield, TrendingDown, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { ThemeMapCard } from '@/components/explore/ThemeMapCard';
import { MobileShell } from '@/components/layout/MobileShell';
import { stockCards } from '@/data/mockStocks';

export default function ExplorePage() {
  const movers = stockCards.filter((card) => card.tags.includes('오늘 급등') || card.priceChangeRate >= 8).slice(0, 3);
  const themes = ['반도체', '로봇', '바이오', 'AI', '2차전지'];
  const flows = stockCards.filter((card) => card.diagnosis.leader.includes('기관') || card.diagnosis.leader.includes('외인')).slice(0, 4);
  const pullbacks = stockCards.filter((card) => card.tags.includes('눌림목') || card.tags.includes('차트자리')).slice(0, 4);
  const afterHours = stockCards.filter((card) => card.tags.includes('시간외') || card.tags.includes('프리마켓') || card.marketType === 'CRYPTO').slice(0, 4);

  return (
    <MobileShell>
      <div className="space-y-6 py-6">
        <header className="flex items-center justify-between px-5">
          <h1 className="text-3xl font-black">탐색</h1>
          <div className="flex gap-3">
            <Search className="h-6 w-6" />
            <Bell className="h-6 w-6" />
          </div>
        </header>

        <SectionShell title="실시간 급등 / 상승예상 / 상한가" href="/explore/movers" hint="등락률 · 거래대금 · 저장 증가">
          <div className="grid grid-cols-3 gap-2">
            {movers.map((card) => (
              <Link key={card.id} href={`/cards/${card.id}`} className="rounded-3xl bg-slate-950 p-3 text-white">
                <p className="text-[11px] font-bold text-blue-200">{card.market}</p>
                <p className="mt-1 truncate text-sm font-black">{card.name}</p>
                <p className="mt-2 text-2xl font-black text-red-300">+{Math.abs(card.priceChangeRate)}%</p>
                <p className="mt-1 text-[11px] font-bold text-slate-300">{card.volumeAmountText}</p>
              </Link>
            ))}
          </div>
        </SectionShell>

        <SectionShell title="인기테마" href="/explore/themes" hint="테마 강도 · 대장주 · 저장 증가">
          <div className="hide-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5">
            {themes.map((theme) => {
              const leaders = stockCards.filter((card) => card.theme.includes(theme)).slice(0, 2);
              return (
                <Link key={theme} href="/explore/themes" className="w-[154px] shrink-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                  <Flame className="h-6 w-6 text-[#0B63F6]" />
                  <p className="mt-3 text-lg font-black">{theme}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">저장 증가 · 강도 높음</p>
                  <p className="mt-3 line-clamp-2 text-xs font-bold text-slate-600">{leaders.map((card) => card.name).join(', ') || '후보 준비중'}</p>
                </Link>
              );
            })}
          </div>
        </SectionShell>

        <SectionShell title="속보뉴스 / 실시간 이슈" href="/explore/news" hint="타임라인 · 키워드 라벨 · 관련 종목">
          <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4">
            {['로봇 테마 거래대금 증가', '반도체 수급 라벨 재확인', '코인 레버리지 과열 유의'].map((news, index) => (
              <div key={news} className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#0B63F6]" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black">{news}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">{index + 1}0분 전 · 키워드 기준</p>
                </div>
                <Newspaper className="h-5 w-5 text-slate-400" />
              </div>
            ))}
          </div>
        </SectionShell>

        <SectionShell title="기관외인매집" href="/explore/flows" hint="기관 / 외인 / 동시매수 랭킹">
          <div className="rounded-3xl border border-slate-200 bg-white p-4">
            <div className="mb-3 grid grid-cols-3 overflow-hidden rounded-2xl bg-slate-100 text-center text-xs font-black">
              <span className="bg-[#0B63F6] py-2 text-white">기관</span>
              <span className="py-2 text-slate-500">외인</span>
              <span className="py-2 text-slate-500">동시매수</span>
            </div>
            <div className="space-y-2">
              {flows.map((card, index) => <RankRow key={card.id} rank={index + 1} cardId={card.id} name={card.name} meta={card.diagnosis.leader} />)}
            </div>
          </div>
        </SectionShell>

        <SectionShell title="하락종목 / 눌림목 후보" href="/explore/pullback" hint="위험도 · 차트자리 라벨">
          <div className="grid grid-cols-2 gap-3">
            {pullbacks.map((card) => (
              <Link key={card.id} href={`/cards/${card.id}`} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <TrendingDown className="h-6 w-6 text-blue-500" />
                <p className="mt-3 text-base font-black">{card.name}</p>
                <p className="mt-1 line-clamp-2 text-xs font-bold text-slate-500">{card.chartSetupType}</p>
                <Badge tone={card.riskLevel === '높음' ? 'orange' : 'blue'}>{card.riskLevel}</Badge>
              </Link>
            ))}
          </div>
        </SectionShell>

        <SectionShell title="시간외 단일가" href="/explore/after-hours" hint="상승률 · 거래대금 · 공시/뉴스">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
            {afterHours.map((card) => (
              <Link key={card.id} href={`/cards/${card.id}`} className="grid grid-cols-[1fr_72px_72px] items-center border-b border-slate-100 p-3 last:border-b-0">
                <div>
                  <p className="text-sm font-black">{card.name}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">{card.fomoMetric}</p>
                </div>
                <p className="text-right text-sm font-black text-red-500">{card.marketType === 'US' ? '위젯' : `+${Math.abs(card.priceChangeRate)}%`}</p>
                <p className="text-right text-xs font-bold text-slate-500">{card.volumeAmountText}</p>
              </Link>
            ))}
          </div>
        </SectionShell>

        <SectionShell title="500MAP / 섹터맵 / 공포탐욕" href="/explore/maps" hint="시장 전체 온도">
          <div className="grid grid-cols-3 gap-3">
            <ThemeMapCard title="500MAP" value="상승 342" tone="green" hint="하락 143" />
            <ThemeMapCard title="섹터맵" value="로봇 +2.35%" hint="저장 증가" />
            <ThemeMapCard title="공포탐욕" value="62 탐욕" tone="orange" hint="관심 과열" />
          </div>
        </SectionShell>
      </div>
    </MobileShell>
  );
}

function SectionShell({ title, href, hint, children }: { title: string; href: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="px-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">{title}</h2>
          <p className="mt-1 text-xs font-black text-[#0B63F6]">{hint}</p>
        </div>
        <Link href={href} className="flex shrink-0 items-center gap-1 text-sm font-black text-[#0B63F6]">
          더보기
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      {children}
    </section>
  );
}

function RankRow({ rank, cardId, name, meta }: { rank: number; cardId: string; name: string; meta: string }) {
  return (
    <Link href={`/cards/${cardId}`} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-sm font-black text-[#0B63F6]">{rank}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black">{name}</p>
        <p className="mt-1 text-xs font-bold text-slate-500">{meta}</p>
      </div>
      <Shield className="h-5 w-5 text-slate-400" />
    </Link>
  );
}
