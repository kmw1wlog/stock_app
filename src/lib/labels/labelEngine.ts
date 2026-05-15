import type { MarketType } from '@/lib/display/displayPolicy';
import type { NormalizedQuote } from '@/lib/providers/types';

export type LabelGrade = 'strong' | 'normal' | 'weak' | 'low' | 'medium' | 'high' | 'caution' | 'pending' | 'increase' | 'decrease' | 'none' | 'hot' | 'cold';

export type AssetLabelView = {
  labelType: string;
  labelKey: string;
  displayText: string;
  grade?: LabelGrade;
  score?: number;
  basis: string;
};

export type LabelInput = {
  market: MarketType;
  quote?: NormalizedQuote | null;
  newsCount?: number;
  communityScore?: number;
  volumeRatio?: number;
};

export function buildCommonLabels(input: LabelInput): AssetLabelView[] {
  const changePct = input.quote?.changePct;
  const basis = input.quote?.basis ?? '공식 데이터 기준';
  const labels: AssetLabelView[] = [];

  if (changePct !== undefined && changePct !== null) {
    labels.push({
      labelType: 'price',
      labelKey: 'change',
      displayText: changePct >= 0 ? '전일/24h 대비 상승' : '전일/24h 대비 하락',
      grade: Math.abs(changePct) >= 8 ? 'strong' : 'normal',
      score: Math.max(0, Math.min(100, 50 + changePct * 4)),
      basis,
    });
  }

  labels.push({
    labelType: 'volume',
    labelKey: 'volume_attention',
    displayText: input.quote?.amount || input.quote?.volume ? '거래량·거래대금 데이터 확인' : '거래량 자료 준비중',
    grade: input.quote?.amount || input.quote?.volume ? 'normal' : 'pending',
    basis,
  });

  if ((input.newsCount ?? 0) > 0) {
    labels.push({
      labelType: 'news',
      labelKey: 'news_attention',
      displayText: '뉴스 검색 결과 있음',
      grade: (input.newsCount ?? 0) > 2 ? 'strong' : 'normal',
      basis: '뉴스 제목/키워드 기준',
    });
  }

  return labels;
}
