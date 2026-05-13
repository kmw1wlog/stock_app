import { Bell, Search } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/common/Badge';
import { Sparkline } from '@/components/common/Sparkline';
import { ExploreSection } from '@/components/explore/ExploreSection';
import { ThemeMapCard } from '@/components/explore/ThemeMapCard';
import { MobileShell } from '@/components/layout/MobileShell';
import { stockCards } from '@/data/mockStocks';

export default function ExplorePage() {
  const sections = [
    { title: '실시간 급등 / 상승예상 / 상한가', hint: '오늘 거래대금과 등락률이 빠르게 붙은 후보', href: '/explore/movers', cards: stockCards.filter((card) => card.tags.includes('오늘 급등')).slice(0, 3) },
    { title: '인기테마', hint: '저장과 상세 확인이 붙은 테마', href: '/explore/themes', cards: stockCards.slice(0, 3) },
    { title: '속보뉴스 / 실시간 이슈', hint: '뉴스 제목/키워드와 앱 반응 기준', href: '/explore/news', cards: stockCards.filter((card) => card.tags.includes('뉴스') || card.fomoType === 'community_heat').slice(0, 3) },
    { title: '기관외인매집', hint: '수급 라벨과 조건식 확인이 같이 붙은 후보', href: '/explore/flows', cards: stockCards.filter((card) => card.diagnosis.leader.includes('기관') || card.diagnosis.leader.includes('외인')).slice(0, 3) },
    { title: '하락종목 / 눌림목 후보', hint: '같은 차트자리에서 다시 확인된 후보', href: '/explore/pullback', cards: stockCards.filter((card) => card.tags.includes('눌림목') || card.tags.includes('차트자리')).slice(0, 3) },
    { title: '시간외 단일가', hint: '장전/장후 다시 볼 후보', href: '/explore/after-hours', cards: stockCards.filter((card) => card.tags.includes('시간외') || card.tags.includes('프리마켓') || card.marketType === 'CRYPTO').slice(0, 3) },
  ];

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

        {sections.map((section) => (
          <ExploreSection key={section.href} title={section.title} hint={section.hint} actionHref={section.href}>
            <div className="space-y-3">
              {section.cards.map((card) => (
                <Link key={card.id} href={`/cards/${card.id}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="min-w-0">
                    <p className="text-xs font-black text-[#0B63F6]">{card.market} · {card.theme}</p>
                    <p className="mt-1 truncate text-lg font-black">{card.name}</p>
                    <p className="mt-1 truncate text-xs font-bold text-slate-500">{card.chartSetupType}</p>
                  </div>
                  <Sparkline small tone={card.priceChangeRate >= 0 ? 'green' : 'blue'} />
                </Link>
              ))}
            </div>
          </ExploreSection>
        ))}

        <ExploreSection title="500MAP / 섹터맵 / 공포탐욕" hint="시장 전체 온도와 섹터 반응" actionHref="/explore/maps">
          <div className="grid grid-cols-3 gap-3">
            <ThemeMapCard title="500MAP" value="상승 342" tone="green" hint="하락 143" />
            <ThemeMapCard title="섹터맵" value="로봇 +2.35%" hint="저장 증가" />
            <ThemeMapCard title="공포탐욕" value="62 탐욕" tone="orange" hint="관심 과열" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {['반도체', '로봇', '바이오', 'AI', '2차전지', 'M7', '대형코인'].map((theme) => (
              <Badge key={theme}>{theme}</Badge>
            ))}
          </div>
        </ExploreSection>
      </div>
    </MobileShell>
  );
}
