import { buildFrontFacts } from '@/lib/cards/cardUiCopy';
import type { DisplayCard } from '@/lib/marketDataTypes';

export type DiagnosisMetricTone = 'good' | 'neutral' | 'caution' | 'risk';

export type DiagnosisMetric = {
  label: string;
  value: string;
  tone: DiagnosisMetricTone;
};

function inferTone(label: string, value: string): DiagnosisMetricTone {
  const text = `${label} ${value}`;
  if (/주의|위험|과열/.test(text)) return 'caution';
  if (/강세|순매수|급증|돌파/.test(text)) return 'good';
  return 'neutral';
}

export function buildDiagnosisMetrics(card: DisplayCard): DiagnosisMetric[] {
  const facts = buildFrontFacts(card);
  const labels = ['관심', '차트자리', '시장대비'] as const;

  return facts.map((fact, index) => ({
    label: labels[index] ?? `지표 ${index + 1}`,
    value: fact.value,
    tone: inferTone(labels[index] ?? '', fact.value),
  }));
}
