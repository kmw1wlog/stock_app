'use client';

const sampleHeights = [78, 72, 75, 62, 58, 49, 45, 38, 44, 36, 28, 24];

export function MiniSampleChart() {
  const width = 320;
  const height = 120;
  const points = sampleHeights
    .map((value, index) => {
      const x = (index / (sampleHeights.length - 1)) * width;
      const y = value;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="rounded-[22px] bg-slate-50 px-3 py-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-black text-slate-700">샘플 차트</p>
        <p className="text-[10px] font-bold text-slate-400">데이터 연결 대기 · 예시 흐름</p>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[116px] w-full overflow-visible">
        <defs>
          <linearGradient id="sampleChartFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0B63F6" stopOpacity="0.26" />
            <stop offset="100%" stopColor="#0B63F6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" y1="102" x2={width} y2="102" stroke="#D7E3F4" strokeDasharray="3 5" />
        <polyline fill="none" stroke="#0B63F6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" points={points} />
        <path d={`M0,102 L${points} L${width},102 Z`} fill="url(#sampleChartFill)" opacity="0.95" />
      </svg>
    </div>
  );
}
