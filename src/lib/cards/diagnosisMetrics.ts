import { buildFrontInsightBadges, type FrontInsightBadge } from '@/lib/cards/cardUiCopy';
import type { DisplayCard } from '@/lib/marketDataTypes';

export type DiagnosisMetricTone = 'good' | 'neutral' | 'caution' | 'risk';

export type DiagnosisMetric = {
  label: string;
  value: string;
  tone: DiagnosisMetricTone;
};

function mapTone(badge: FrontInsightBadge): DiagnosisMetricTone {
  if (badge.tone === 'primary') return 'good';
  if (badge.tone === 'caution') return 'caution';
  return 'neutral';
}

export function buildDiagnosisMetrics(card: DisplayCard): DiagnosisMetric[] {
  return buildFrontInsightBadges(card).map((badge) => ({
    label: badge.label,
    value: badge.value,
    tone: mapTone(badge),
  }));
}
