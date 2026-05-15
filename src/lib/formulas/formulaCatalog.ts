import type { DisplayCard } from '@/lib/marketDataTypes';

export type FormulaDefinition = {
  key: string;
  name: string;
  shortName: string;
  cardLabel: string;
  userIntent: string;
  alertPreviewTemplate: string;
  description: string;
  criteria: string[];
  excludeRules: string[];
  defaultExpiresInDays: number;
  riskNote: string;
};

export type FormulaFitLabel = '지금 가장 잘 맞음' | '관찰용' | '조건 부족' | '위험 감시';

export type FormulaCandidate = {
  formula: FormulaDefinition;
  fitScore: number;
  fitLabel: FormulaFitLabel;
  matchedReasons: string[];
  missingReasons?: string[];
  riskTags?: string[];
};

const volumeSpike: FormulaDefinition = {
  key: 'volume_spike',
  name: '거래량 급증 + 가격 반응',
  shortName: '거래량 급증',
  cardLabel: '거래량 폭발형',
  userIntent: '거래량이 먼저 붙고 가격이 따라붙는 종목을 다시 확인하기 위한 조건',
  alertPreviewTemplate: '{name} 조건식 알림 · {reason}',
  description: '평소 대비 거래량 또는 거래대금 증가와 가격 반응이 함께 확인되는 구간을 보여줍니다.',
  criteria: ['20일 평균 대비 거래량 증가', '당일 가격 반응 확인', '거래대금 또는 거래량 데이터 확인', '테마/뉴스 라벨은 보조 근거로만 사용'],
  excludeRules: ['거래정지 종목 제외', '표시 가능한 공식 데이터가 없는 종목 제외', '거래량 증가를 호재로 단정하지 않음'],
  defaultExpiresInDays: 7,
  riskNote: '거래량 급증 구간은 단기 변동성이 커질 수 있으며 매수·매도 추천이 아닙니다.',
};

const previousHighApproach: FormulaDefinition = {
  key: 'previous_high_approach',
  name: '전고점 접근 감시',
  shortName: '전고점 접근',
  cardLabel: '전고점 접근형',
  userIntent: '최근 고점에 다시 가까워지는 종목을 관찰하기 위한 조건',
  alertPreviewTemplate: '{name} 조건식 알림 · {reason}',
  description: '전고점까지의 거리, 거래 증가, 추세 회복 여부를 함께 확인합니다.',
  criteria: ['최근 고점까지 1~5% 이내 접근', '거래량 증가 또는 회복', '이동평균/차트자리 회복 라벨 확인', '급등 후 무리한 추격 구간은 낮게 평가'],
  excludeRules: ['전고점 거리 데이터가 없으면 관찰용으로만 표시', '윗꼬리 과다 또는 돌파 실패 정황은 위험 태그 표시'],
  defaultExpiresInDays: 7,
  riskNote: '전고점 접근은 돌파를 보장하지 않으며 조건 충족 사실만 알려줍니다.',
};

const newHighBreakout: FormulaDefinition = {
  key: 'new_high_breakout',
  name: '신고가 돌파 확인',
  shortName: '신고가 돌파',
  cardLabel: '신고가 돌파형',
  userIntent: '이미 강한 종목의 추세 지속 여부를 다시 확인하기 위한 조건',
  alertPreviewTemplate: '{name} 조건식 알림 · {reason}',
  description: '20일/60일 고점 돌파, 거래대금, 종가 고가권 유지 여부를 함께 봅니다.',
  criteria: ['20일 또는 60일 고점 돌파 라벨 확인', '거래대금 충분', '종가 또는 현재가가 고가권 유지', '테마 동반 상승은 보조 근거'],
  excludeRules: ['과열 태그가 크면 위험 감시로 낮춤', '거래 데이터가 없으면 신고가 라벨만으로 단정하지 않음'],
  defaultExpiresInDays: 5,
  riskNote: '신고가 돌파 구간은 되돌림도 빠를 수 있어 위험 태그를 함께 확인해야 합니다.',
};

const pullbackRebreak: FormulaDefinition = {
  key: 'pullback_rebreak',
  name: '눌림 후 재돌파',
  shortName: '눌림 재돌파',
  cardLabel: '눌림 후 재돌파형',
  userIntent: '이미 움직였던 종목이 조정 뒤 다시 힘을 받는지 확인하기 위한 조건',
  alertPreviewTemplate: '{name} 조건식 알림 · {reason}',
  description: '조정 기간, 이동평균 회복, 거래량 재증가, 이전 고점 재접근을 함께 확인합니다.',
  criteria: ['최근 상승 후 3~10일 조정', '5일/20일선 근처 반등 또는 차트자리 라벨', '거래량 회복', '이전 고점 재접근'],
  excludeRules: ['조정 기간 데이터가 없으면 보조 후보로 표시', '저유동성 종목은 낮게 평가'],
  defaultExpiresInDays: 10,
  riskNote: '눌림 후 반등 조건은 재하락 가능성도 함께 고려해야 하는 참고 정보입니다.',
};

const volatilityExpansion: FormulaDefinition = {
  key: 'volatility_expansion',
  name: '변동성 압축 후 확장',
  shortName: '압축 후 확장',
  cardLabel: '변동성 확장형',
  userIntent: '조용하던 종목이 움직이기 시작하는 초기 구간을 관찰하기 위한 조건',
  alertPreviewTemplate: '{name} 조건식 알림 · {reason}',
  description: '최근 변동성 축소 뒤 거래량과 장중 범위가 다시 커지는지 확인합니다.',
  criteria: ['최근 변동폭 축소', '거래량 감소 후 재증가', '박스권 상단 또는 차트자리 접근', '장중 range 확대'],
  excludeRules: ['변동성 데이터가 부족하면 관찰용으로만 표시', '급등 직후 과열 구간은 위험 태그 표시'],
  defaultExpiresInDays: 10,
  riskNote: '변동성 확장은 방향을 단정하지 않으며 조건 발생 사실만 알려줍니다.',
};

const themeBreadth: FormulaDefinition = {
  key: 'theme_breadth',
  name: '테마 동반 상승',
  shortName: '테마 동반',
  cardLabel: '테마 동반 상승형',
  userIntent: '개별 종목보다 테마 흐름이 먼저 붙는 상황을 확인하기 위한 조건',
  alertPreviewTemplate: '{name} 조건식 알림 · {reason}',
  description: '같은 테마 종목 다수의 상승, 해당 종목의 가격/거래 반응, 뉴스 라벨을 함께 확인합니다.',
  criteria: ['같은 테마 종목 다수 상승', '해당 종목도 가격 또는 거래 조건 충족', '테마 내 거래대금 증가', '대장주/후발주 여부 확인'],
  excludeRules: ['테마 라벨만으로 상승을 단정하지 않음', '후발 과열 가능성이 있으면 위험 태그 표시'],
  defaultExpiresInDays: 7,
  riskNote: '테마 흐름은 빠르게 바뀔 수 있으며 매수·매도 추천이 아닙니다.',
};

const newsReaction: FormulaDefinition = {
  key: 'news_reaction',
  name: '뉴스/공시 반응 확인',
  shortName: '뉴스 반응',
  cardLabel: '뉴스/공시 반응형',
  userIntent: '뉴스가 떴다는 사실보다 시장 반응이 붙었는지 확인하기 위한 조건',
  alertPreviewTemplate: '{name} 조건식 알림 · 뉴스/공시 이후 반응 확인',
  description: '뉴스/공시 라벨과 이후 거래량, 가격 방향, 테마 동반 여부를 함께 봅니다.',
  criteria: ['뉴스/공시 라벨 존재', '뉴스 이후 거래량 증가', '가격 방향 확인', '테마 동반 여부 확인'],
  excludeRules: ['뉴스 내용의 호재/악재를 앱이 단정하지 않음', '공시 원문 확인 없이 투자 영향을 판단하지 않음'],
  defaultExpiresInDays: 7,
  riskNote: '뉴스와 공시는 원문과 맥락 확인이 필요하며 조건 충족 정보로만 제공합니다.',
};

const intradayHighHold: FormulaDefinition = {
  key: 'intraday_high_hold',
  name: '장중 고가권 유지',
  shortName: '고가권 유지',
  cardLabel: '고가권 유지형',
  userIntent: '단순 급등이 아니라 힘이 유지되는 종목을 확인하기 위한 조건',
  alertPreviewTemplate: '{name} 조건식 알림 · {reason}',
  description: '현재가가 장중 고가 근처에 남아 있고 상승분 반납이 제한적인지 확인합니다.',
  criteria: ['현재가가 장중 고가 근처', '상승분 반납 제한', '거래대금 유지', '장중 변동성은 위험 태그로 함께 표시'],
  excludeRules: ['고가권 데이터가 없으면 가격/라벨 기반 관찰용으로 표시', '윗꼬리가 크면 낮게 평가'],
  defaultExpiresInDays: 3,
  riskNote: '고가권 유지 조건은 장중 참고 정보이며 종가 흐름과 다를 수 있습니다.',
};

const afterHoursReaction: FormulaDefinition = {
  key: 'after_hours_reaction',
  name: '시간외/장마감 반응',
  shortName: '시간외 반응',
  cardLabel: '시간외 반응형',
  userIntent: '장 마감 전후 반응이 다음 관심종목으로 이어지는지 확인하기 위한 조건',
  alertPreviewTemplate: '{name} 조건식 알림 · 장마감 전후 반응 확인',
  description: '장후반 거래량 증가, 시간외 가격/거래 반응, 다음날 관심 지속 여부를 확인합니다.',
  criteria: ['장후반 거래량 증가', '시간외 상승 또는 거래량 발생', '다음날 재확인 가능한 관심종목', '공식 시간외 데이터 기준'],
  excludeRules: ['시간외 데이터가 없으면 조건 부족 표시', '시간외 움직임을 다음날 방향으로 단정하지 않음'],
  defaultExpiresInDays: 3,
  riskNote: '시간외 반응은 유동성이 낮을 수 있어 다음 정규장 데이터와 함께 확인해야 합니다.',
};

const riskWatch: FormulaDefinition = {
  key: 'risk_watch',
  name: '변동성 확대 · 과열 주의',
  shortName: '위험 감시',
  cardLabel: '위험 감시형',
  userIntent: '상승 조건만이 아니라 과열, 윗꼬리, 저유동성 위험을 감시하기 위한 조건',
  alertPreviewTemplate: '{name} 조건식 알림 · 변동성/과열 신호 확인',
  description: '급등, 윗꼬리, 거래량 과열, 투자주의 가능성 등 위험 신호를 별도로 보여줍니다.',
  criteria: ['장중 변동폭 확대', '윗꼬리 또는 상승분 반납', '거래량 과열', '투자주의/경고 가능성 확인'],
  excludeRules: ['위험 감시는 매수 알림이 아님', '위험 태그가 없으면 후보 점수를 낮게 표시'],
  defaultExpiresInDays: 3,
  riskNote: '위험 감시 조건은 손실 가능성을 줄이기 위한 참고 알림이며 투자 판단은 이용자 책임입니다.',
};

export const formulaCatalog: Record<string, FormulaDefinition> = {
  volume_spike: volumeSpike,
  previous_high_approach: previousHighApproach,
  new_high_breakout: newHighBreakout,
  pullback_rebreak: pullbackRebreak,
  volatility_expansion: volatilityExpansion,
  theme_breadth: themeBreadth,
  news_reaction: newsReaction,
  intraday_high_hold: intradayHighHold,
  after_hours_reaction: afterHoursReaction,
  risk_watch: riskWatch,

  kr_gainer: volumeSpike,
  kr_loser: riskWatch,
  kr_volume: volumeSpike,
  kr_disclosure: newsReaction,
  kr_news: newsReaction,
  chart_setup: previousHighApproach,
  crypto_gainer_24h: volumeSpike,
  crypto_loser_24h: riskWatch,
  us_widget: newsReaction,
};

const coreFormulas = [
  volumeSpike,
  previousHighApproach,
  newHighBreakout,
  pullbackRebreak,
  volatilityExpansion,
  themeBreadth,
  newsReaction,
  intradayHighHold,
  afterHoursReaction,
  riskWatch,
];

function hasAnyLabel(card: DisplayCard, pattern: RegExp) {
  return card.labels.some((label) => pattern.test(label));
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function addIf(condition: boolean, points: number) {
  return condition ? points : 0;
}

function labelNumber(card: DisplayCard, pattern: RegExp) {
  for (const label of [card.primaryReason, card.secondaryReason ?? '', ...card.labels]) {
    const match = label.match(pattern);
    if (match?.[1]) return Number(match[1]);
  }
  return undefined;
}

function amountReason(card: DisplayCard) {
  if (!card.amount) return undefined;
  if (card.market === 'KR') return `거래대금 ${Math.round(card.amount / 100000000).toLocaleString()}억`;
  return `거래대금 ${Math.round(card.amount).toLocaleString()}`;
}

function themeReason(card: DisplayCard) {
  const breadth = card.themeSnapshot?.themeBreadthUpCount;
  if (breadth && breadth > 1) return `같은 테마 ${breadth}종목 동반 상승`;
  if (card.theme) return `${card.theme} 테마 확인`;
  return undefined;
}

function derivedFeatures(card: DisplayCard) {
  const technical = card.technicalSnapshot;
  const risk = card.riskSnapshot;
  const volumeRatio20 = technical?.volumeRatio20 ?? labelNumber(card, /(?:거래량|볼륨)[^\d]*(\d+(?:\.\d+)?)배/);
  const distanceToPrevHighPct = technical?.distanceToPrevHighPct ?? labelNumber(card, /전고점[^\d]*(\d+(?:\.\d+)?)%/);
  const closeToHighPct = technical?.closeToHighPct ?? (hasAnyLabel(card, /고가권|상승분 반납 제한/) ? 85 : undefined);
  const intradayRangePct = technical?.intradayRangePct ?? labelNumber(card, /(?:장중|변동폭|range)[^\d]*(\d+(?:\.\d+)?)%/i);
  const upperWickPct = risk?.upperWickPct ?? labelNumber(card, /윗꼬리[^\d]*(\d+(?:\.\d+)?)%/);
  const overheatScore = risk?.overheatScore ?? (Math.abs(card.changePct ?? 0) >= 15 ? 70 : Math.abs(card.changePct ?? 0) >= 10 ? 45 : 0);
  const hasVolume = Boolean(card.volume || card.amount || volumeRatio20);
  const isUp = (card.changePct ?? 0) > 0;
  const isDown = (card.changePct ?? 0) < 0;
  const hasNews = hasAnyLabel(card, /뉴스|공시|SEC|DART|이슈/);
  const hasTheme = Boolean(card.theme || card.themeSnapshot?.themeBreadthUpCount || hasAnyLabel(card, /테마|섹터/));
  const hasBreakout = hasAnyLabel(card, /신고가|돌파|고점 돌파/) || Boolean(technical?.breakoutLookbackDays);
  const hasPullback = hasAnyLabel(card, /눌림|조정|재돌파|반등/) || Boolean(technical?.pullbackDays);
  const hasAfterHours = hasAnyLabel(card, /시간외|장마감|장후반|After/);
  const isLowLiquidity = Boolean(risk?.isLowLiquidity || hasAnyLabel(card, /저유동성|거래부족/));
  const isInvestmentWarning = Boolean(risk?.isInvestmentWarning || hasAnyLabel(card, /투자주의|투자경고|관리종목/));
  const amountRankPct = technical?.amountRankPct ?? ((card.amount ?? 0) > 0 ? 70 : undefined);
  const themeBreadthUpCount = card.themeSnapshot?.themeBreadthUpCount ?? (hasTheme ? 3 : 0);
  const themeAvgChangePct = card.themeSnapshot?.themeAvgChangePct;

  return {
    amountRankPct,
    closeToHighPct,
    distanceToPrevHighPct,
    hasAfterHours,
    hasBreakout,
    hasNews,
    hasPullback,
    hasTheme,
    hasVolume,
    intradayRangePct,
    isDown,
    isInvestmentWarning,
    isLowLiquidity,
    isUp,
    overheatScore,
    pullbackDays: technical?.pullbackDays,
    themeAvgChangePct,
    themeBreadthUpCount,
    upperWickPct,
    volumeRatio20,
    volatilityRank20: technical?.volatilityRank20,
  };
}

function fitLabel(score: number, riskOnly = false): FormulaFitLabel {
  if (riskOnly && score >= 62) return '위험 감시';
  if (score >= 78) return '지금 가장 잘 맞음';
  if (score >= 58) return '관찰용';
  return '조건 부족';
}

function riskTags(card: DisplayCard, riskScore: number) {
  const features = derivedFeatures(card);
  const tags: string[] = [];
  if (features.isInvestmentWarning) tags.push('투자주의/경고 확인 필요');
  if (features.isLowLiquidity) tags.push('저유동성 주의');
  if ((features.upperWickPct ?? 0) >= 8) tags.push('윗꼬리 과다');
  if ((features.overheatScore ?? 0) >= 60 || riskScore >= 24) tags.push('과열 가능성');
  if (Math.abs(card.changePct ?? 0) >= 10) tags.push('단기 변동성 큼');
  return tags;
}

function riskPenalty(card: DisplayCard) {
  const features = derivedFeatures(card);
  let penalty = 0;
  penalty += addIf(features.isLowLiquidity, 14);
  penalty += addIf(features.isInvestmentWarning, 18);
  penalty += addIf((features.upperWickPct ?? 0) >= 8, 12);
  penalty += addIf((features.overheatScore ?? 0) >= 70, 10);
  return penalty;
}

function technicalReasons(card: DisplayCard) {
  const features = derivedFeatures(card);
  const reasons: string[] = [];
  if (features.volumeRatio20) reasons.push(`거래량 20일 평균 대비 ${features.volumeRatio20.toFixed(1)}배`);
  if (features.distanceToPrevHighPct) reasons.push(`전고점까지 ${features.distanceToPrevHighPct.toFixed(1)}%`);
  if (features.closeToHighPct) reasons.push('장중 고가권 유지');
  if (features.hasBreakout) reasons.push('고점 돌파 라벨 확인');
  if (features.hasPullback) reasons.push('조정 후 재상승 정황');
  const amount = amountReason(card);
  if (amount) reasons.push(amount);
  if (typeof card.changePct === 'number') reasons.push(`${card.changePct > 0 ? '+' : ''}${card.changePct.toFixed(2)}% 가격 반응`);
  return reasons;
}

export function buildCardEvidenceLine(card: DisplayCard) {
  const features = derivedFeatures(card);
  const parts: string[] = [];
  if (features.volumeRatio20) parts.push(`거래량 ${features.volumeRatio20.toFixed(1)}배`);
  if (features.distanceToPrevHighPct) parts.push(`전고점 ${features.distanceToPrevHighPct.toFixed(1)}% 근접`);
  const theme = themeReason(card);
  if (theme) parts.push(theme);
  if (!parts.length && typeof card.changePct === 'number') parts.push(`${card.changePct > 0 ? '+' : ''}${card.changePct.toFixed(2)}%`);
  const amount = amountReason(card);
  if (amount && parts.length < 3) parts.push(amount);
  if (features.hasNews && parts.length < 3) parts.push('뉴스/공시 이후 반응 확인');
  if (card.chartSetupType && parts.length < 3) parts.push('차트자리 확인');
  const importantLabel = card.labels.find((label) => /거래|뉴스|공시|SEC|공포|탐욕|차트|시간외/.test(label));
  if (importantLabel && parts.length < 3) parts.push(importantLabel);
  return parts.length ? parts.slice(0, 3).join(' · ') : card.primaryReason || card.dataBasisLabel;
}

function scoreFormula(card: DisplayCard, formula: FormulaDefinition): Omit<FormulaCandidate, 'formula'> {
  const features = derivedFeatures(card);
  const penalty = riskPenalty(card);
  const reasons: string[] = [];
  const missing: string[] = [];
  let score = 0;

  if (formula.key === volumeSpike.key) {
    score =
      (features.volumeRatio20 ? clamp(features.volumeRatio20 * 11, 12, 35) : addIf(features.hasVolume, 18)) +
      addIf(features.isUp, 20) +
      addIf((features.amountRankPct ?? 0) >= 60 || Boolean(card.amount), 15) +
      addIf(features.hasTheme || features.hasNews, 15) +
      addIf((features.closeToHighPct ?? 0) >= 70, 10) -
      penalty;
    if (features.volumeRatio20) reasons.push(`거래량 ${features.volumeRatio20.toFixed(1)}배`);
    if (features.isUp) reasons.push('가격 상승 동반');
    if (card.amount) reasons.push(amountReason(card)!);
    if (features.hasTheme || features.hasNews) reasons.push(features.hasTheme ? '테마 흐름 동반' : '뉴스/공시 라벨 확인');
    if (!features.hasVolume) missing.push('거래량/거래대금 데이터 부족');
  }

  if (formula.key === previousHighApproach.key) {
    const distanceScore = features.distanceToPrevHighPct ? (features.distanceToPrevHighPct <= 5 ? 35 : features.distanceToPrevHighPct <= 10 ? 20 : 8) : 0;
    score = distanceScore + addIf(features.hasVolume, 20) + addIf(features.isUp || Boolean(card.chartSetupType), 15) + addIf(features.hasPullback, 15) + addIf(features.hasTheme, 10) - penalty;
    if (features.distanceToPrevHighPct) reasons.push(`전고점 ${features.distanceToPrevHighPct.toFixed(1)}% 근접`);
    if (features.hasVolume) reasons.push('거래 증가 정황');
    if (card.chartSetupType) reasons.push('차트자리 확인');
    if (!features.distanceToPrevHighPct) missing.push('전고점 거리 데이터 부족');
  }

  if (formula.key === newHighBreakout.key) {
    score = addIf(features.hasBreakout, 35) + addIf(features.hasVolume, 20) + addIf((features.closeToHighPct ?? 0) >= 70, 20) + addIf(features.hasTheme, 10) + addIf(features.isUp, 10) - penalty;
    if (features.hasBreakout) reasons.push('신고가/돌파 라벨 확인');
    if (features.closeToHighPct) reasons.push('고가권 유지');
    if (features.hasVolume) reasons.push('거래 데이터 확인');
    if (!features.hasBreakout) missing.push('신고가/돌파 데이터 부족');
  }

  if (formula.key === pullbackRebreak.key) {
    score = addIf(features.hasPullback, 30) + addIf(Boolean(features.pullbackDays && features.pullbackDays >= 3 && features.pullbackDays <= 10), 20) + addIf(features.hasVolume, 20) + addIf(features.distanceToPrevHighPct !== undefined && features.distanceToPrevHighPct <= 8, 15) + addIf(features.isUp, 10) - penalty;
    if (features.hasPullback) reasons.push('눌림/재돌파 라벨 확인');
    if (features.pullbackDays) reasons.push(`조정 ${features.pullbackDays}일 후 반응`);
    if (features.hasVolume) reasons.push('거래량 회복 정황');
    if (!features.hasPullback) missing.push('눌림 후 재상승 데이터 부족');
  }

  if (formula.key === volatilityExpansion.key) {
    score = addIf((features.volatilityRank20 ?? 0) <= 35 && features.volatilityRank20 !== undefined, 25) + addIf((features.intradayRangePct ?? 0) >= 4, 22) + addIf(features.hasVolume, 20) + addIf(Boolean(card.chartSetupType), 15) + addIf(features.isUp, 8) - penalty / 2;
    if (features.volatilityRank20 !== undefined) reasons.push('최근 변동성 압축');
    if (features.intradayRangePct) reasons.push(`장중 변동폭 ${features.intradayRangePct.toFixed(1)}%`);
    if (features.hasVolume) reasons.push('거래량 재증가 정황');
    if (features.volatilityRank20 === undefined && !features.intradayRangePct) missing.push('변동성 압축 데이터 부족');
  }

  if (formula.key === themeBreadth.key) {
    score = addIf(features.themeBreadthUpCount >= 3, 30) + (features.themeAvgChangePct ? clamp(features.themeAvgChangePct * 5, 5, 20) : addIf(features.hasTheme, 15)) + addIf(features.isUp, 15) + addIf(features.hasVolume, 15) + addIf(features.hasNews, 10) - penalty / 2;
    const theme = themeReason(card);
    if (theme) reasons.push(theme);
    if (features.isUp) reasons.push('해당 종목 가격 반응');
    if (features.hasVolume) reasons.push('거래 데이터 동반');
    if (!features.hasTheme) missing.push('테마 동반 상승 데이터 부족');
  }

  if (formula.key === newsReaction.key) {
    score = addIf(features.hasNews, 35) + addIf(features.hasVolume, 20) + addIf(features.isUp || features.isDown, 15) + addIf(features.hasTheme, 10) + addIf((features.closeToHighPct ?? 0) >= 70, 10) - penalty / 2;
    if (features.hasNews) reasons.push('뉴스/공시 라벨 확인');
    if (features.hasVolume) reasons.push('뉴스 이후 거래 반응 확인');
    if (features.isUp || features.isDown) reasons.push('가격 방향 확인');
    if (!features.hasNews) missing.push('뉴스/공시 라벨 부족');
  }

  if (formula.key === intradayHighHold.key) {
    score = addIf((features.closeToHighPct ?? 0) >= 80, 35) + addIf(features.isUp, 20) + addIf(features.hasVolume, 15) + addIf((features.upperWickPct ?? 0) < 6, 12) + addIf((features.intradayRangePct ?? 0) >= 3, 8) - penalty / 2;
    if (features.closeToHighPct) reasons.push('장중 고가권 유지');
    if (features.isUp) reasons.push('상승분 유지');
    if (features.hasVolume) reasons.push('거래대금 유지 정황');
    if (!features.closeToHighPct) missing.push('고가권 유지 데이터 부족');
  }

  if (formula.key === afterHoursReaction.key) {
    score = addIf(features.hasAfterHours, 38) + addIf(features.hasVolume, 16) + addIf(features.hasNews, 12) + addIf(features.isUp, 10) + addIf(card.market === 'KR', 8) - penalty / 2;
    if (features.hasAfterHours) reasons.push('시간외/장마감 라벨 확인');
    if (features.hasVolume) reasons.push('장후반 거래 반응 정황');
    if (features.hasNews) reasons.push('뉴스/공시 이후 반응 확인');
    if (!features.hasAfterHours) missing.push('시간외 반응 데이터 부족');
  }

  if (formula.key === riskWatch.key) {
    score =
      addIf((features.upperWickPct ?? 0) >= 8, 30) +
      addIf((features.intradayRangePct ?? 0) >= 6 || Math.abs(card.changePct ?? 0) >= 10, 20) +
      addIf((features.volumeRatio20 ?? 0) >= 4 || (features.overheatScore ?? 0) >= 60, 20) +
      addIf(features.isInvestmentWarning, 20) +
      addIf((features.closeToHighPct ?? 100) < 55, 10) +
      addIf(features.isLowLiquidity, 10);
    if (features.upperWickPct) reasons.push(`윗꼬리 ${features.upperWickPct.toFixed(1)}%`);
    if (Math.abs(card.changePct ?? 0) >= 10) reasons.push('단기 변동성 확대');
    if ((features.volumeRatio20 ?? 0) >= 4) reasons.push('거래량 과열 가능성');
    if (features.isInvestmentWarning) reasons.push('투자주의/경고 확인 필요');
    if (!reasons.length) missing.push('뚜렷한 위험 태그 부족');
  }

  const boundedScore = Math.round(clamp(score));
  const tags = riskTags(card, penalty).slice(0, 3);
  return {
    fitScore: boundedScore,
    fitLabel: fitLabel(boundedScore, formula.key === riskWatch.key),
    matchedReasons: reasons.length ? reasons.slice(0, 4) : technicalReasons(card).slice(0, 3),
    missingReasons: missing.length ? missing.slice(0, 2) : undefined,
    riskTags: tags.length ? tags : undefined,
  };
}

export function getFormulaCandidatesForCard(card: DisplayCard): FormulaCandidate[] {
  return coreFormulas
    .map((formula) => ({
      formula,
      ...scoreFormula(card, formula),
    }))
    .sort((a, b) => b.fitScore - a.fitScore);
}

export function getPrimaryFormulaForCard(card: DisplayCard): FormulaDefinition {
  return getFormulaCandidatesForCard(card)[0]?.formula ?? volumeSpike;
}

export function getFormulaForCard(card: DisplayCard): FormulaDefinition {
  return getPrimaryFormulaForCard(card);
}

export function formatFormulaCopy(card: DisplayCard, formula: FormulaDefinition) {
  return [
    `조건식: ${formula.name}`,
    `종목: ${card.name}(${card.symbol})`,
    `목적: ${formula.userIntent}`,
    '',
    '기준:',
    ...formula.criteria.map((item, index) => `${index + 1}. ${item}`),
    '',
    '제외/주의 기준:',
    ...formula.excludeRules.map((item, index) => `${index + 1}. ${item}`),
    '',
    formula.riskNote,
    '',
    '본 조건식은 매수·매도 추천이 아닌 조건 충족 참고 정보입니다.',
  ].join('\n');
}
