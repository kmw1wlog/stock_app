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
  const areaPath = `M0,102 L${points} L${width},102 Z`;

  return (
    <div className="rounded-[16px] bg-[#F6FAFF] px-3 py-2.5">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-black text-slate-700">가격 흐름</p>
        <p className="text-[10px] font-bold text-slate-400">예시</p>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[104px] w-full overflow-visible">
        <defs>
          <linearGradient id="sampleChartFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0B63F6" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <rect x="0" y="8" width={width} height="94" rx="14" fill="#ECF3FF" />
        <line x1="0" y1="102" x2={width} y2="102" stroke="#C6D7F6" strokeDasharray="4 5" />
        <path d={areaPath} fill="url(#sampleChartFill)" opacity="1" />
        <polyline fill="none" stroke="#1D4ED8" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
        <circle cx="320" cy="24" r="4.5" fill="#1D4ED8" />
      </svg>
    </div>
  );
}
