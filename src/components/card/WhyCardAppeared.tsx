import { BarChart3, FileText, LineChart } from 'lucide-react';
import type { StockCard } from '@/data/mockStocks';

export function WhyCardAppeared({ card }: { card: StockCard }) {
  const blocks = [
    {
      title: '시장 데이터',
      icon: BarChart3,
      items: [card.titleReason, card.chartSetupType, card.dataBasisLabel],
    },
    {
      title: '앱 내부 데이터',
      icon: LineChart,
      items: [card.fomoHeadline, card.sourceLabel ?? '앱 내 저장/복사 이벤트 기준'],
    },
    {
      title: '뉴스·공시·커뮤니티',
      icon: FileText,
      items: ['제목 일부, 키워드, 링크, 자체 라벨 중심으로 제공합니다.', card.subReason],
    },
  ];

  return (
    <section className="px-5">
      <h2 className="mb-3 text-xl font-black">왜 이 카드가 떴나요?</h2>
      <div className="grid gap-3">
        {blocks.map((block) => {
          const Icon = block.icon;
          return (
            <div key={block.title} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-blue-50 text-[#0B63F6]">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-black">{block.title}</h3>
              </div>
              <ul className="space-y-2 text-sm font-semibold leading-6 text-slate-600">
                {block.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
