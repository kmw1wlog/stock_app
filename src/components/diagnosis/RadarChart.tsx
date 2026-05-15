export function RadarChart({ axes, mine, avg }: { axes: string[]; mine: number[]; avg: number[] }) {
  const center = 105;
  const radius = 76;
  const points = (values: number[]) =>
    values
      .map((value, index) => {
        const angle = -Math.PI / 2 + (Math.PI * 2 * index) / values.length;
        const scale = value / 100;
        return `${center + Math.cos(angle) * radius * scale},${center + Math.sin(angle) * radius * scale}`;
      })
      .join(' ');
  const outer = points(Array.from({ length: axes.length }, () => 100));

  return (
    <svg viewBox="0 0 210 210" className="h-64 w-full">
      {[0.25, 0.5, 0.75, 1].map((scale) => (
        <polygon key={scale} points={points(Array.from({ length: axes.length }, () => scale * 100))} fill="none" stroke="#CBD5E1" strokeWidth="1" />
      ))}
      {axes.map((axis, index) => {
        const angle = -Math.PI / 2 + (Math.PI * 2 * index) / axes.length;
        const x = center + Math.cos(angle) * (radius + 22);
        const y = center + Math.sin(angle) * (radius + 22);
        return (
          <g key={axis}>
            <line x1={center} y1={center} x2={center + Math.cos(angle) * radius} y2={center + Math.sin(angle) * radius} stroke="#E2E8F0" />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="800" fill="#0F172A">
              {axis}
            </text>
          </g>
        );
      })}
      <polygon points={outer} fill="#EFF6FF" opacity="0.4" />
      <polygon points={points(avg)} fill="none" stroke="#64748B" strokeWidth="2.5" strokeDasharray="5 5" />
      <polygon points={points(mine)} fill="rgba(11,99,246,0.18)" stroke="#0B63F6" strokeWidth="3" />
    </svg>
  );
}
