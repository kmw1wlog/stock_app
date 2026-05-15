type SparklineProps = {
  tone?: 'blue' | 'green' | 'red' | 'orange';
  small?: boolean;
};

const stroke = {
  blue: '#0B63F6',
  green: '#00A676',
  red: '#EF4444',
  orange: '#F59E0B',
};

export function Sparkline({ tone = 'blue', small }: SparklineProps) {
  return (
    <svg viewBox="0 0 160 72" className={small ? 'h-12 w-28' : 'h-20 w-40'} role="img" aria-label="가격 흐름">
      <defs>
        <linearGradient id={`spark-${tone}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke[tone]} stopOpacity="0.24" />
          <stop offset="100%" stopColor={stroke[tone]} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M4 58 C18 42 28 54 40 38 S64 28 76 34 94 18 106 26 122 48 136 28 148 24 156 12 L156 72 L4 72 Z" fill={`url(#spark-${tone})`} />
      <path d="M4 58 C18 42 28 54 40 38 S64 28 76 34 94 18 106 26 122 48 136 28 148 24 156 12" fill="none" stroke={stroke[tone]} strokeWidth="5" strokeLinecap="round" />
      <circle cx="156" cy="12" r="7" fill={stroke[tone]} />
    </svg>
  );
}
