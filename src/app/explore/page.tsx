import { Bell, Search } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/common/Badge';
import { Sparkline } from '@/components/common/Sparkline';
import { ExploreSection } from '@/components/explore/ExploreSection';
import { MarketMiniCard } from '@/components/explore/MarketMiniCard';
import { ThemeMapCard } from '@/components/explore/ThemeMapCard';
import { MobileShell } from '@/components/layout/MobileShell';
import { accumulation, afterHours, losers, marketMovers, news, themes } from '@/data/mockExplore';

export default function ExplorePage() {
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

        <ExploreSection title="실시간 급등 / 상승예상 / 상한가" hint="오늘 저장률이 빠르게 오른 종목">
          <div className="grid grid-cols-3 gap-3">
            {marketMovers.map((item) => <MarketMiniCard key={item.label} {...item} />)}
          </div>
        </ExploreSection>

        <ExploreSection title="하락종목 / 눌림목 후보" hint="비슷한 반응 구간이 다시 붙는 구간">
          <div className="grid grid-cols-3 gap-3">
            {losers.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-black text-slate-500">{item.label}</p>
                <p className={item.value.startsWith('-') ? 'mt-2 text-xl font-black text-blue-500' : 'mt-2 text-lg font-black text-slate-950'}>{item.value}</p>
                <p className="mt-1 line-clamp-2 text-[11px] font-bold leading-4 text-slate-500">{item.hint}</p>
                <Sparkline small tone={item.value.startsWith('-') ? 'blue' : 'green'} />
              </div>
            ))}
          </div>
        </ExploreSection>

        <ExploreSection title="시간외단일가" hint="장후 다시 반응한 후보">
          <div className="space-y-2 rounded-3xl border border-slate-200 bg-white p-4">
            {afterHours.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm font-bold">
                <span>{item.name}</span>
                <span className={item.rate.startsWith('-') ? 'text-blue-500' : 'text-red-500'}>{item.rate}</span>
                <span className="text-slate-400">{item.time}</span>
              </div>
            ))}
          </div>
        </ExploreSection>

        <ExploreSection title="인기테마" hint="커뮤니티 언급량 증가">
          <div className="flex flex-wrap gap-2">
            {themes.map((theme) => <Badge key={theme}>{theme}</Badge>)}
          </div>
        </ExploreSection>

        <ExploreSection title="기관·외인 매집" hint="기관·외인이 동시에 본 종목">
          <div className="space-y-3">
            {accumulation.map((item) => (
              <Link key={item.label} href={`/cards/${item.card.id}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                <div>
                  <p className="text-xs font-black text-orange-500">{item.label}</p>
                  <p className="mt-1 text-lg font-black">{item.card.name}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">{item.hint}</p>
                </div>
                <Sparkline small />
              </Link>
            ))}
          </div>
        </ExploreSection>

        <ExploreSection title="속보뉴스 / 실시간 이슈" hint="커뮤니티 반응 상세로 이어지는 뉴스">
          <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-4">
            {news.map((item, index) => <p key={item} className="text-sm font-bold text-slate-700">{index + 1}. {item}</p>)}
          </div>
        </ExploreSection>

        <ExploreSection title="500MAP / 섹터맵 / 공포탐욕" hint="놓치면 내일 다시 확인할 카드">
          <div className="grid grid-cols-3 gap-3">
            <ThemeMapCard title="500MAP" value="상승 342" tone="green" hint="하락 143" />
            <ThemeMapCard title="섹터맵" value="로봇 +2.35%" hint="저장 증가" />
            <ThemeMapCard title="공포탐욕" value="62 탐욕" tone="orange" hint="관심 과열" />
          </div>
        </ExploreSection>
      </div>
    </MobileShell>
  );
}
