import type { DisplayCard } from '@/lib/marketDataTypes';

export type DiagnosisMetricTone = 'good' | 'neutral' | 'caution' | 'risk';

export type DiagnosisMetric = {
  label: string;
  value: string;
  tone: DiagnosisMetricTone;
};

function hasKeyword(card: DisplayCard, keyword: string) {
  return card.labels.some((label) => label.includes(keyword));
}

function scoreCard(card: DisplayCard) {
  let score = 52;
  const changePct = card.changePct ?? 0;
  if (changePct > 4) score += 10;
  else if (changePct > 0) score += 6;
  else if (changePct < -6) score -= 8;
  if (card.amount) score += 10;
  else if (card.volume) score += 5;
  if (card.chartSetupType) score += 8;
  if (hasKeyword(card, '뉴스') || hasKeyword(card, '공시') || hasKeyword(card, 'SEC')) score += 5;
  if (Math.abs(changePct) >= 10) score -= 6;
  return Math.max(0, Math.min(100, score));
}

function flowValue(card: DisplayCard) {
  const changePct = card.changePct ?? 0;
  if (changePct > 3) return { value: '상승 흐름', tone: 'good' as const };
  if (changePct > 0) return { value: '흐름 관찰', tone: 'neutral' as const };
  if (changePct < -5) return { value: '하락 유의', tone: 'caution' as const };
  if (changePct < 0) return { value: '조정 관찰', tone: 'neutral' as const };
  return { value: '관찰 중', tone: 'neutral' as const };
}

function tradeValue(card: DisplayCard) {
  if (card.amount) return { value: '거래대금 확인', tone: 'good' as const };
  if (card.volume) return { value: '거래량 관찰', tone: 'neutral' as const };
  return { value: '거래 대기', tone: 'neutral' as const };
}

function volatilityValue(card: DisplayCard) {
  const abs = Math.abs(card.changePct ?? 0);
  if (abs >= 10) return { value: '매우 큼', tone: 'risk' as const };
  if (abs >= 6) return { value: '유의', tone: 'caution' as const };
  if (abs >= 3) return { value: '보통', tone: 'neutral' as const };
  if (abs > 0) return { value: '낮음', tone: 'good' as const };
  return { value: '관찰', tone: 'neutral' as const };
}

function riskValue(card: DisplayCard) {
  const abs = Math.abs(card.changePct ?? 0);
  if (abs >= 10) return { value: '높음', tone: 'risk' as const };
  if (abs >= 6) return { value: '주의', tone: 'caution' as const };
  return { value: '보통', tone: 'neutral' as const };
}

export function buildDiagnosisMetrics(card: DisplayCard): DiagnosisMetric[] {
  const score = scoreCard(card);
  const flow = flowValue(card);
  const trade = tradeValue(card);
  const volatility = volatilityValue(card);
  const news = hasKeyword(card, '뉴스');
  const disclosure = hasKeyword(card, '공시') || hasKeyword(card, 'SEC');
  const chartSetup = Boolean(card.chartSetupType || hasKeyword(card, '차트자리'));

  return [
    { label: '진단', value: `${score}`, tone: score >= 70 ? 'good' : score < 45 ? 'caution' : 'neutral' },
    { label: '흐름', value: flow.value, tone: flow.tone },
    { label: '거래', value: trade.value, tone: trade.tone },
    { label: '변동성', value: volatility.value, tone: volatility.tone },
    { label: '수급', value: card.market === 'KR' ? '대기' : '시장 기준', tone: 'neutral' },
    { label: '뉴스', value: news ? '확인' : '대기', tone: news ? 'good' : 'neutral' },
    { label: '공시', value: disclosure ? '확인' : '확인 중', tone: disclosure ? 'good' : 'neutral' },
    { label: '차트자리', value: chartSetup ? '확인' : '대기', tone: chartSetup ? 'good' : 'neutral' },
    { label: '같은테마', value: card.theme ? '연결됨' : '대기', tone: card.theme ? 'good' : 'neutral' },
    { label: '리스크', value: riskValue(card).value, tone: riskValue(card).tone },
    { label: '시간외반응', value: card.market === 'KR' ? '확인 중' : card.market === 'US' ? '위젯 기준' : '24h 기준', tone: 'neutral' },
  ];
}
