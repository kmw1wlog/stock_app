'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { AssetChart } from '@/components/chart/AssetChart';
import { MtsViewButton } from '@/components/mts/MtsViewButton';
import { useAppState } from '@/context/AppStateContext';
import type { DisplayCard } from '@/lib/marketDataTypes';

const maShort = ['5', '10', '20'];
const maLong = ['20', '60', '120'];
const maConditions = ['골든크로스', '데드크로스', '상향돌파', '하향이탈'];
const rsiLevels = ['30', '50', '70'];
const rsiConditions = ['이하 진입', '이상 진입', '반등'];
const macdConditions = ['Signal 상향돌파', 'Signal 하향이탈'];

export function DailyChartPanel({ card }: { card: DisplayCard }) {
  const { logEvent, showToast } = useAppState();
  const [ma, setMa] = useState({ short: '5', long: '20', condition: '골든크로스' });
  const [rsi, setRsi] = useState({ level: '30', condition: '반등' });
  const [macd, setMacd] = useState('Signal 상향돌파');

  const createTechAlert = (kind: 'MA_n' | 'RSI' | 'MACD', value: Record<string, string>) => {
    logEvent('tech_alert_create', { cardKey: card.id, symbol: card.symbol, market: card.market, kind, ...value });
    showToast(`${kind} 조건 알림을 기록했습니다.`);
  };

  return (
    <section className="flex h-full flex-col rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black text-[#0B63F6]">상세차트 / 기술지표</p>
      <h2 className="mt-1 text-2xl font-black">일봉 차트</h2>
      <div className="mt-3 overflow-hidden rounded-3xl border border-slate-200">
        <AssetChart market={card.market} assetKey={card.assetKey} tvSymbol={card.tvSymbol ?? undefined} coingeckoId={card.coingeckoId ?? undefined} />
      </div>
      <div className="mt-4 space-y-3 overflow-y-auto pr-1">
        <Picker title="MA_n" options={maShort} value={ma.short} onChange={(short) => setMa((current) => ({ ...current, short }))} />
        <Picker title="장기선" options={maLong} value={ma.long} onChange={(long) => setMa((current) => ({ ...current, long }))} />
        <Picker title="MA 조건" options={maConditions} value={ma.condition} onChange={(condition) => setMa((current) => ({ ...current, condition }))} />
        <Picker title="RSI 기준" options={rsiLevels} value={rsi.level} onChange={(level) => setRsi((current) => ({ ...current, level }))} />
        <Picker title="RSI 조건" options={rsiConditions} value={rsi.condition} onChange={(condition) => setRsi((current) => ({ ...current, condition }))} />
        <Picker title="MACD" options={macdConditions} value={macd} onChange={setMacd} />
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
        <TechButton label="MA 알림" onClick={() => createTechAlert('MA_n', ma)} />
        <TechButton label="RSI 알림" onClick={() => createTechAlert('RSI', rsi)} />
        <TechButton label="MACD 알림" onClick={() => createTechAlert('MACD', { condition: macd })} />
        <MtsViewButton card={card} source="home" label="MTS에서 보기" className="h-12" />
      </div>
    </section>
  );
}

function Picker({ title, options, value, onChange }: { title: string; options: string[]; value: string; onChange: (value: string) => void }) {
  const { logEvent } = useAppState();
  return (
    <div>
      <p className="mb-1 text-xs font-black text-slate-500">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              logEvent('tech_condition_select', { title, value: option });
              onChange(option);
            }}
            className={value === option ? 'rounded-full bg-slate-950 px-3 py-1.5 text-xs font-black text-white' : 'rounded-full border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-600'}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function TechButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex h-12 items-center justify-center gap-1 rounded-2xl bg-[#0B63F6] px-3 text-xs font-black text-white">
      <Bell className="h-4 w-4" />
      {label}
    </button>
  );
}
