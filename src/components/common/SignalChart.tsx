import { Badge } from './Badge';

export function SignalChart({ compact = false }: { compact?: boolean }) {
  const bars = [18, 30, 22, 28, 42, 25, 36, 48, 26, 32, 44, 68, 54, 78];
  const candles = [72, 60, 68, 51, 58, 44, 50, 36, 42, 28, 34, 20, 14, 9];

  return (
    <div className={`relative overflow-hidden rounded-[24px] deep-card ${compact ? 'h-40' : 'h-[420px]'} p-6 text-white`}>
      <div className="absolute -right-10 top-8 h-44 w-44 rounded-full bg-blue-300/20 blur-2xl" />
      <div className="relative z-10">
        {!compact ? (
          <>
            <p className="text-sm font-bold text-blue-100">추천 테마</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>로봇 테마</Badge>
              <Badge tone="gray">국장</Badge>
              <Badge tone="violet">단기형</Badge>
            </div>
          </>
        ) : null}
      </div>
      <div className="absolute left-6 right-6 top-[42%] h-px bg-blue-200/10" />
      <div className={compact ? 'absolute bottom-6 left-4 right-4 h-28' : 'absolute bottom-20 left-6 right-6 h-52'}>
        <svg viewBox="0 0 330 210" className="h-full w-full" preserveAspectRatio="none">
          <path d="M8 145 C48 112 70 134 108 98 S170 84 202 92 244 54 322 28" fill="none" stroke="#54A3FF" strokeWidth="5" strokeLinecap="round" />
          {candles.map((y, index) => (
            <g key={index} transform={`translate(${index * 23 + 10}, ${y})`}>
              <line x1="6" x2="6" y1="-18" y2="42" stroke={index % 3 === 0 ? '#FF6B72' : '#55A6FF'} strokeWidth="2" />
              <rect x="0" y="0" width="12" height="34" rx="3" fill={index % 3 === 0 ? '#FF6B72' : '#55A6FF'} />
            </g>
          ))}
          {bars.map((height, index) => (
            <rect key={index} x={index * 23 + 8} y={196 - height} width="12" height={height} rx="2" fill="#0B63F6" opacity="0.55" />
          ))}
        </svg>
      </div>
      {!compact ? (
        <>
          <div className="absolute right-8 top-[48%] rounded-xl bg-[#0B63F6] px-4 py-2 text-sm font-black shadow-lg">거래대금 급증</div>
          <div className="absolute bottom-36 right-12 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-black shadow-lg">20일선 돌파</div>
        </>
      ) : null}
    </div>
  );
}
