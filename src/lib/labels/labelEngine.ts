import type { MarketType } from '@/lib/display/displayPolicy';
import type { NormalizedQuote } from '@/lib/providers/types';

export type AssetLabelView = {
  labelType: string;
  labelKey: string;
  displayText: string;
  grade?: '강함' | '보통' | '약함' | '낮음' | '중간' | '높음' | '유의' | '경고' | '증가' | '감소' | '없음';
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
  const changePct = input.quote?.changePct ?? 0;
  const volumeRatio = input.volumeRatio ?? (input.quote?.volume ? 1.6 : 1);
  return [
    {
      labelType: 'momentum',
      labelKey: 'upward_pressure',
      displayText: changePct > 8 ? '상승압력 강함' : changePct < -3 ? '상승압력 약함' : '상승압력 보통',
      grade: changePct > 8 ? '강함' : changePct < -3 ? '약함' : '보통',
      score: Math.max(0, Math.min(100, 50 + changePct * 4)),
      basis: input.quote?.basis ?? 'mock label basis',
    },
    {
      labelType: 'trend',
      labelKey: 'short_trend',
      displayText: changePct > 3 ? '추세 상승 지속' : changePct < -2 ? '추세 약세 전환' : '추세 횡보',
      grade: changePct > 3 ? '강함' : changePct < -2 ? '약함' : '보통',
      basis: input.quote?.basis ?? 'mock label basis',
    },
    {
      labelType: 'volume',
      labelKey: 'volume_attention',
      displayText: volumeRatio > 1.5 ? '거래량 관심 증가' : '거래량 보통',
      grade: volumeRatio > 1.5 ? '증가' : '보통',
      basis: input.quote?.basis ?? 'mock label basis',
    },
    {
      labelType: 'risk',
      labelKey: 'risk_level',
      displayText: Math.abs(changePct) > 10 ? '위험도 높음' : Math.abs(changePct) > 5 ? '위험도 중간' : '위험도 낮음',
      grade: Math.abs(changePct) > 10 ? '높음' : Math.abs(changePct) > 5 ? '중간' : '낮음',
      basis: input.quote?.basis ?? 'mock label basis',
    },
    {
      labelType: 'news',
      labelKey: 'news_attention',
      displayText: (input.newsCount ?? 0) > 2 ? '뉴스 관심 증가' : '뉴스 관심 보통',
      grade: (input.newsCount ?? 0) > 2 ? '증가' : '보통',
      basis: '뉴스 제목/키워드 기준',
    },
    {
      labelType: 'community',
      labelKey: 'community_attention',
      displayText: (input.communityScore ?? 0) > 60 ? '커뮤니티 의견 증가' : '커뮤니티 관심 보통',
      grade: (input.communityScore ?? 0) > 60 ? '증가' : '보통',
      basis: '커뮤니티 링크/앱 의견 클릭 기준',
    },
  ];
}
