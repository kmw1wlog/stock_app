export type DiagnosisGrade = 'very_good' | 'good' | 'neutral' | 'caution' | 'risk';

export type DiagnosisLabel = {
  label: string;
  value: string;
  grade: DiagnosisGrade;
  helpText: string;
};

export function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function gradeFromScore(score: number): DiagnosisGrade {
  if (score >= 85) return 'very_good';
  if (score >= 70) return 'good';
  if (score >= 55) return 'neutral';
  if (score >= 40) return 'caution';
  return 'risk';
}

export function gradeText(grade: DiagnosisGrade) {
  switch (grade) {
    case 'very_good':
      return '매우좋음';
    case 'good':
      return '좋음';
    case 'neutral':
      return '보통';
    case 'caution':
      return '유의';
    case 'risk':
      return '위험';
  }
}

export function stars(value: number) {
  const count = Math.max(1, Math.min(5, Math.round(value)));
  return '★'.repeat(count) + '☆'.repeat(5 - count);
}

export function flowLabel(institutionNet?: number | null, foreignNet?: number | null): DiagnosisLabel {
  if (institutionNet === null || institutionNet === undefined || foreignNet === null || foreignNet === undefined) {
    return { label: '기관외인매집', value: '자료 부족', grade: 'neutral', helpText: '기관/외인 수급 원천 데이터가 아직 저장되지 않았습니다.' };
  }
  if (institutionNet > 0 && foreignNet > 0) {
    return { label: '기관외인매집', value: '기관·외인 동반 매집', grade: 'very_good', helpText: '기관과 외인 순매수 라벨이 함께 확인됐습니다.' };
  }
  if (institutionNet > 0 && foreignNet <= 0) return { label: '기관외인매집', value: '기관 매집 우위', grade: 'good', helpText: '기관 수급이 외인보다 우위입니다.' };
  if (institutionNet <= 0 && foreignNet > 0) return { label: '기관외인매집', value: '외인 매집 우위', grade: 'good', helpText: '외인 수급이 기관보다 우위입니다.' };
  if (institutionNet < 0 && foreignNet < 0) return { label: '기관외인매집', value: '매도 우위', grade: 'caution', helpText: '기관과 외인 모두 매도 우위로 분류됐습니다.' };
  return { label: '기관외인매집', value: '혼조', grade: 'neutral', helpText: '기관과 외인 방향이 뚜렷하지 않습니다.' };
}

export function supplyStars(institutionNet?: number | null, foreignNet?: number | null) {
  if (institutionNet === null || institutionNet === undefined || foreignNet === null || foreignNet === undefined) return 3;
  if (institutionNet > 0 && foreignNet > 0) return 5;
  if (institutionNet > 0 || foreignNet > 0) return 4;
  if (institutionNet < 0 && foreignNet < 0) return 2;
  return 3;
}

export function volumeLabel(volumeRatio?: number | null, amount?: number | null): DiagnosisLabel {
  if (!volumeRatio && !amount) return { label: '거래량', value: '자료 부족', grade: 'neutral', helpText: '최근 거래량 비교 데이터가 아직 부족합니다.' };
  const ratio = volumeRatio ?? 1;
  if (ratio >= 3) return { label: '거래량', value: '폭증', grade: 'very_good', helpText: '최근 평균 대비 거래량이 크게 증가했습니다.' };
  if (ratio >= 2) return { label: '거래량', value: '급증', grade: 'good', helpText: '최근 평균 대비 거래량이 증가했습니다.' };
  if (ratio >= 1.2) return { label: '거래량', value: '증가', grade: 'good', helpText: '평균보다 높은 거래량입니다.' };
  if (ratio < 0.8) return { label: '거래량', value: '감소', grade: 'caution', helpText: '최근 평균 대비 거래량이 줄었습니다.' };
  return { label: '거래량', value: '보통', grade: 'neutral', helpText: '최근 평균과 유사한 거래량입니다.' };
}

export function volatilityLabel(atrRatio?: number | null): DiagnosisLabel {
  if (atrRatio === null || atrRatio === undefined) return { label: '변동성 ATR', value: '자료 부족', grade: 'neutral', helpText: '고가/저가 기반 변동성 계산 데이터가 부족합니다.' };
  if (atrRatio < 0.03) return { label: '변동성 ATR', value: '안정', grade: 'good', helpText: '종가 대비 고저폭이 낮은 편입니다.' };
  if (atrRatio < 0.06) return { label: '변동성 ATR', value: '보통', grade: 'neutral', helpText: '일반적인 변동성 범위입니다.' };
  if (atrRatio < 0.1) return { label: '변동성 ATR', value: '유의', grade: 'caution', helpText: '변동성이 커질 수 있는 구간입니다.' };
  return { label: '변동성 ATR', value: '위험', grade: 'risk', helpText: '종가 대비 고저폭이 큰 구간입니다.' };
}

export function shortSellingLabel(shortWeightPct?: number | null): DiagnosisLabel {
  if (shortWeightPct === null || shortWeightPct === undefined) return { label: '공매도', value: '자료 부족', grade: 'neutral', helpText: '공매도 원천 데이터가 아직 확인되지 않았습니다.' };
  if (shortWeightPct < 3) return { label: '공매도', value: '낮음', grade: 'good', helpText: '거래 대비 공매도 비중이 낮은 구간입니다.' };
  if (shortWeightPct < 7) return { label: '공매도', value: '보통', grade: 'neutral', helpText: '공매도 비중이 보통 범위입니다.' };
  if (shortWeightPct < 12) return { label: '공매도', value: '유의', grade: 'caution', helpText: '공매도 비중을 확인할 필요가 있습니다.' };
  return { label: '공매도', value: '위험', grade: 'risk', helpText: '공매도 비중이 높은 구간으로 분류됐습니다.' };
}

export function simpleLabel(label: string, value: string, grade: DiagnosisGrade, helpText: string): DiagnosisLabel {
  return { label, value, grade, helpText };
}
