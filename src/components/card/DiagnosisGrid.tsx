import { Star } from 'lucide-react';
import type { StockCard } from '@/data/mockStocks';

export function DiagnosisGrid({ card }: { card: StockCard }) {
  const items = [
    ['종목진단점수', `${card.diagnosis.score}/100`],
    ['최근 1개월', card.diagnosis.monthChange],
    ['주도주체', card.diagnosis.leader],
    ['수급별점', '★'.repeat(card.diagnosis.supplyStars) + '☆'.repeat(5 - card.diagnosis.supplyStars)],
    ['재무', card.diagnosis.finance],
    ['밸류에이션', card.diagnosis.valuation],
    ['섹터 모멘텀', card.diagnosis.sectorMomentum],
    ['변동성 ATR', card.diagnosis.atr],
    ['거래량', card.diagnosis.volume],
    ['숏/공매도', card.diagnosis.shortSelling],
  ];

  return (
    <section className="px-5">
      <h2 className="mb-3 text-xl font-black">종목 진단 요약</h2>
      <div className="grid grid-cols-2 gap-3">
        {items.map(([label, value], index) => (
          <div key={label} className={index === 0 ? 'col-span-2 rounded-3xl bg-[#0B63F6] p-5 text-white shadow-lg shadow-blue-500/25' : 'rounded-2xl border border-slate-200 bg-white p-4'}>
            <p className={index === 0 ? 'text-sm font-bold text-blue-100' : 'text-xs font-bold text-slate-500'}>{label}</p>
            <p className={index === 0 ? 'mt-1 text-4xl font-black' : 'mt-1 truncate text-lg font-black text-slate-950'}>{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-700">
        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
        본 진단은 지표 기반 참고 정보이며 투자 권유가 아닙니다.
      </div>
    </section>
  );
}
