import type { DisplayCard } from '@/lib/marketDataTypes';

export type FormulaPhase = '예비포착' | '발동' | '후속관찰' | '테마' | '위험감시';
export type FormulaFitLabel = '가장 적합' | '관찰용' | '조건 부족' | '위험 감시' | '지금 가장 잘 맞음';

export type FormulaDefinition = {
  key: string;
  name: string;
  shortName: string;
  cardLabel: string;
  phase: FormulaPhase;
  userIntent: string;
  alertPreviewTemplate: string;
  description: string;
  criteria: string[];
  excludeRules: string[];
  defaultExpiresInDays: number;
  riskNote: string;
};

export type FormulaCandidate = {
  formula: FormulaDefinition;
  fitScore: number;
  fitLabel: FormulaFitLabel;
  phase: FormulaPhase;
  matchedReasons: string[];
  missingReasons?: string[];
  riskTags?: string[];
  alertLine: string;
};

const definitions: FormulaDefinition[] = [
  {
    key: 'volume_spike',
    name: '거래량 폭발형',
    shortName: '거래량 폭발',
    cardLabel: '초반 포착형',
    phase: '발동',
    userIntent: '시간대 보정 거래량과 거래대금이 동시에 붙는 급등 조건을 다시 확인합니다.',
    alertPreviewTemplate: '{name} 조건식 알림 · {reason}',
    description: '현재 시각 기준 거래량/거래대금 이상징후와 VWAP 위 가격 반응을 함께 봅니다.',
    criteria: ['시간대 보정 거래량 2.5배 이상', '시간대 보정 거래대금 2.0배 이상', '당일 +2% 이상 또는 VWAP 위 유지', '거래대금 최소 기준 통과'],
    excludeRules: ['거래대금이 너무 낮은 종목 제외', '투자주의/경고는 위험 태그 표시', '조건 충족은 매수·매도 추천이 아님'],
    defaultExpiresInDays: 7,
    riskNote: '거래량 급증 구간은 단기 변동성이 커질 수 있습니다.',
  },
  {
    key: 'previous_high_approach',
    name: '전고점 접근형',
    shortName: '전고점 접근',
    cardLabel: '돌파 대기형',
    phase: '예비포착',
    userIntent: '고점 돌파 직전 후보를 관찰합니다.',
    alertPreviewTemplate: '{name} 조건식 알림 · {reason}',
    description: '최근 20일 고점 1~5% 이내 접근과 거래 증가를 함께 확인합니다.',
    criteria: ['최근 20일 고점 3% 안팎 접근', '당일 상승', '5일선 또는 VWAP 위', '거래량 증가'],
    excludeRules: ['전고점 거리 데이터가 없으면 조건 부족', '윗꼬리 과다 시 위험 태그 표시'],
    defaultExpiresInDays: 7,
    riskNote: '전고점 접근은 돌파를 보장하지 않는 관찰 조건입니다.',
  },
  {
    key: 'new_high_breakout',
    name: '신고가 돌파형',
    shortName: '신고가 돌파',
    cardLabel: '강한 추세형',
    phase: '발동',
    userIntent: '20일/60일 고점을 실제로 돌파한 강한 종목을 감시합니다.',
    alertPreviewTemplate: '{name} 조건식 알림 · {reason}',
    description: '고점 돌파, 거래량 동반, VWAP 위 유지 여부를 봅니다.',
    criteria: ['최근 20일 고점 돌파', '시간대 보정 거래량 1.5배 이상', 'VWAP 위', '거래대금 최소 기준 통과'],
    excludeRules: ['과열 태그가 크면 위험 감시로 낮춤', '거래 데이터 없이 돌파만 단정하지 않음'],
    defaultExpiresInDays: 5,
    riskNote: '돌파 직후 되돌림 가능성을 함께 봐야 합니다.',
  },
  {
    key: 'box_breakout',
    name: '박스권 상단 돌파형',
    shortName: '박스 돌파',
    cardLabel: '박스 돌파형',
    phase: '발동',
    userIntent: '횡보하던 종목이 박스 상단을 뚫는 조건을 확인합니다.',
    alertPreviewTemplate: '{name} 조건식 알림 · {reason}',
    description: '10~20일 박스권 압축 뒤 거래량이 붙으며 상단을 돌파하는지 봅니다.',
    criteria: ['최근 박스권 고저폭 12% 이하', '20일 박스 상단 돌파', '거래량 1.8배 이상', 'VWAP 위'],
    excludeRules: ['박스 구조 데이터가 부족하면 관찰용', '돌파 후 바로 이탈하면 위험 태그'],
    defaultExpiresInDays: 7,
    riskNote: '박스 돌파 조건은 실패 돌파 가능성이 있습니다.',
  },
  {
    key: 'pullback_rebreak',
    name: '눌림 후 재돌파형',
    shortName: '눌림 재돌파',
    cardLabel: '눌림 재시동형',
    phase: '후속관찰',
    userIntent: '한 번 오른 종목이 조정 뒤 다시 움직이는지 확인합니다.',
    alertPreviewTemplate: '{name} 조건식 알림 · {reason}',
    description: '고점 대비 -5~-15% 조정 뒤 5일선/VWAP 회복과 단기 고가 돌파를 봅니다.',
    criteria: ['최근 20일 내 조정 경험', '5일선 재상향', '최근 3일 고가 돌파', '거래량 1.5배 이상'],
    excludeRules: ['조정 데이터가 없으면 조건 부족', '저유동성 종목은 감점'],
    defaultExpiresInDays: 10,
    riskNote: '재돌파 실패 시 다시 눌릴 수 있는 조건입니다.',
  },
  {
    key: 'follow_through_bull_candle',
    name: '장대양봉 후속관찰형',
    shortName: '후속 관찰',
    cardLabel: '후속 관찰형',
    phase: '후속관찰',
    userIntent: '전일 급등주가 다음 날에도 거래를 유지하는지 확인합니다.',
    alertPreviewTemplate: '{name} 조건식 알림 · {reason}',
    description: '전일 +8% 이상과 거래량 급증 이후 오늘 전일 종가/VWAP를 지키는지 봅니다.',
    criteria: ['전일 +8% 이상', '전일 거래량 3배 이상', '오늘 전일 종가 -3% 이내 유지', '오늘 거래량 1.2배 이상'],
    excludeRules: ['전일 데이터 부족 시 조건 부족', '갭 상승 후 급락은 위험 태그'],
    defaultExpiresInDays: 3,
    riskNote: '전일 급등주는 변동성이 커질 수 있습니다.',
  },
  {
    key: 'theme_breadth',
    name: '테마 동반 상승형',
    shortName: '테마 동반',
    cardLabel: '테마 확산형',
    phase: '테마',
    userIntent: '같은 테마가 함께 움직이는 상황에서 강한 종목을 확인합니다.',
    alertPreviewTemplate: '{name} 조건식 알림 · {reason}',
    description: '테마 상승 종목 수, 평균 등락률, 테마 거래대금 집중을 함께 봅니다.',
    criteria: ['테마 상승 종목 5개 이상', '테마 상승 비율 40% 이상', '테마 평균 +2% 이상', '테마 거래대금 1.8배 이상'],
    excludeRules: ['테마 라벨만으로 상승을 단정하지 않음', '후발 과열은 위험 태그 표시'],
    defaultExpiresInDays: 7,
    riskNote: '테마 흐름은 빠르게 바뀔 수 있습니다.',
  },
  {
    key: 'risk_watch',
    name: '위험 감시형',
    shortName: '위험 감시',
    cardLabel: '과열 주의형',
    phase: '위험감시',
    userIntent: '급등·과열·저유동성 위험을 매수 신호가 아닌 관찰 알림으로 봅니다.',
    alertPreviewTemplate: '{name} 조건식 알림 · 변동성/과열 신호 확인',
    description: '당일 +15%, 거래량 5배, 장중 변동폭 12%, 투자주의 라벨 등을 감시합니다.',
    criteria: ['당일 +15% 이상 또는 장중 변동폭 확대', '거래량 과열', '투자주의/경고 라벨', '저유동성 위험'],
    excludeRules: ['위험 감시는 매수 알림이 아님', '위험 태그가 없으면 낮은 점수'],
    defaultExpiresInDays: 3,
    riskNote: '위험 감시 조건은 손실 가능성 확인용입니다.',
  },
  {
    key: 'opening_gap_hold',
    name: '시초 갭 유지형',
    shortName: '갭 유지',
    cardLabel: '시초 갭 유지형',
    phase: '예비포착',
    userIntent: '시초 갭 이후 힘이 유지되는 종목을 확인합니다.',
    alertPreviewTemplate: '{name} 조건식 알림 · {reason}',
    description: '갭 +3% 이상, 시초가 유지, VWAP 위, 초반 거래량을 봅니다.',
    criteria: ['시초 갭 +3% 이상', '현재가가 시초가 99% 이상', 'VWAP 위', '시간대 보정 거래량 2배 이상'],
    excludeRules: ['갭 상승 후 이탈하면 위험 태그', '거래대금 부족 시 감점'],
    defaultExpiresInDays: 3,
    riskNote: '갭 유지 실패 시 변동성이 커질 수 있습니다.',
  },
  {
    key: 'morning_high_rebreak',
    name: '오전 고점 재돌파형',
    shortName: '오전 고점 재돌파',
    cardLabel: '오전 2차 파동형',
    phase: '발동',
    userIntent: '오전에 튄 종목이 다시 고점을 뚫는 순간을 확인합니다.',
    alertPreviewTemplate: '{name} 조건식 알림 · {reason}',
    description: '오전 고점 재돌파와 눌림 후 거래량 재유입을 봅니다.',
    criteria: ['오전 고점 존재', '현재가가 오전 고점 돌파', '직전 눌림폭 5% 이내', '재돌파 봉 거래량 1.8배 이상'],
    excludeRules: ['오전 고점 데이터 없으면 조건 부족', '돌파 후 이탈 시 위험 태그'],
    defaultExpiresInDays: 3,
    riskNote: '장중 재돌파는 실패 돌파 가능성이 있습니다.',
  },
  {
    key: 'vwap_reclaim',
    name: 'VWAP 재장악형',
    shortName: 'VWAP 재장악',
    cardLabel: '평균단가 회복형',
    phase: '발동',
    userIntent: '밀렸다가 평균단가 위로 다시 올라오는 종목을 확인합니다.',
    alertPreviewTemplate: '{name} 조건식 알림 · {reason}',
    description: '장중 VWAP 아래 체류 뒤 현재가가 VWAP와 5분봉 20MA 위로 회복하는지 봅니다.',
    criteria: ['장중 VWAP 아래 체류', '현재가 VWAP 위', '5분봉 20MA 위', '직전 5봉 대비 거래량 1.5배'],
    excludeRules: ['VWAP 데이터 없으면 조건 부족', '재이탈 시 위험 태그'],
    defaultExpiresInDays: 3,
    riskNote: 'VWAP 회복은 평균단가 참고 지표이며 결과를 보장하지 않습니다.',
  },
  {
    key: 'amount_rank_jump',
    name: '거래대금 순위 급상승형',
    shortName: '거래대금 급상승',
    cardLabel: '시장 관심 유입형',
    phase: '발동',
    userIntent: '시장 관심이 갑자기 몰리는 종목을 확인합니다.',
    alertPreviewTemplate: '{name} 조건식 알림 · {reason}',
    description: '거래대금 상위권 진입과 전일 대비 순위 상승을 봅니다.',
    criteria: ['거래대금 시장 상위 100위', '전일 대비 200계단 이상 상승', '거래대금 2배 이상', '당일 +2% 이상'],
    excludeRules: ['순위 데이터 없으면 보조 후보', '저유동성 급등은 위험 태그'],
    defaultExpiresInDays: 5,
    riskNote: '거래대금 집중은 관심 증가의 참고 지표입니다.',
  },
  {
    key: 'market_relative_strength',
    name: '시장 역행 강세형',
    shortName: '상대강도',
    cardLabel: '시장 역행 강세형',
    phase: '예비포착',
    userIntent: '지수가 약한데 혼자 강한 종목을 확인합니다.',
    alertPreviewTemplate: '{name} 조건식 알림 · {reason}',
    description: '시장 대비 상대강도와 거래량 증가를 함께 봅니다.',
    criteria: ['KOSPI/KOSDAQ 약세', '종목 +3% 이상', '시장 대비 상대강도 +4% 이상', '거래량 1.5배 이상'],
    excludeRules: ['시장 지수 데이터 부족 시 조건 부족', '단일 뉴스성 급등은 위험 태그'],
    defaultExpiresInDays: 7,
    riskNote: '시장 역행 강세는 단기 변동성이 클 수 있습니다.',
  },
  {
    key: 'afternoon_reacceleration',
    name: '오후 재가속형',
    shortName: '오후 재가속',
    cardLabel: '오후 재가속형',
    phase: '후속관찰',
    userIntent: '오전에 쉬던 종목이 오후에 다시 움직이는지 확인합니다.',
    alertPreviewTemplate: '{name} 조건식 알림 · {reason}',
    description: '오전 상승 경험, 점심 눌림/횡보, 13시 이후 단기 고점 돌파를 봅니다.',
    criteria: ['오전 +3% 이상 경험', '11~13:30 눌림/횡보', '13시 이후 단기 고점 돌파', 'VWAP 위 회복'],
    excludeRules: ['장중 시간대 데이터 부족 시 조건 부족', '오후 급등 후 변동성은 위험 태그'],
    defaultExpiresInDays: 3,
    riskNote: '오후 재가속은 종가 변동성이 커질 수 있습니다.',
  },
  {
    key: 'limit_up_watch',
    name: '상한가 근접 관찰형',
    shortName: '상한가 근접',
    cardLabel: '상한가 근접형',
    phase: '위험감시',
    userIntent: '상한가 근처 체류와 극단 변동성을 위험 관찰로 봅니다.',
    alertPreviewTemplate: '{name} 조건식 알림 · {reason}',
    description: '+25% 이상, 고가권 체류, 거래량 과열을 관찰합니다.',
    criteria: ['당일 +25% 이상', '당일 고가 99% 이상', '거래량 3배 이상', '고가권 5분 이상 체류'],
    excludeRules: ['매수 유도 문구 금지', '위험/관찰 알림으로 취급'],
    defaultExpiresInDays: 1,
    riskNote: '상한가 근접은 극단 변동성 구간입니다.',
  },
  {
    key: 'after_hours_follow_through',
    name: '시간외 후속 확인형',
    shortName: '시간외 후속',
    cardLabel: '시간외 후속 확인형',
    phase: '후속관찰',
    userIntent: '전일 시간외 강세가 정규장 거래로 이어지는지 확인합니다.',
    alertPreviewTemplate: '{name} 조건식 알림 · {reason}',
    description: '전일 시간외 +3%, 오늘 전일 종가 위, 장초반 거래량 증가를 봅니다.',
    criteria: ['전일 시간외 +3% 이상', '시간외 거래대금 최소 기준', '오늘 전일 종가 이상', '장초반 거래량 1.5배 이상'],
    excludeRules: ['시간외 데이터 없으면 조건 부족', '정규장 미확인은 단정하지 않음'],
    defaultExpiresInDays: 3,
    riskNote: '시간외 움직임은 유동성이 낮을 수 있습니다.',
  },
];

export const formulaCatalog = Object.fromEntries(definitions.map((formula) => [formula.key, formula])) as Record<string, FormulaDefinition>;

Object.assign(formulaCatalog, {
  kr_gainer: formulaCatalog.volume_spike,
  kr_loser: formulaCatalog.risk_watch,
  kr_volume: formulaCatalog.volume_spike,
  kr_disclosure: formulaCatalog.after_hours_follow_through,
  kr_news: formulaCatalog.volume_spike,
  chart_setup: formulaCatalog.previous_high_approach,
  crypto_gainer_24h: formulaCatalog.volume_spike,
  crypto_loser_24h: formulaCatalog.risk_watch,
  us_widget: formulaCatalog.market_relative_strength,
});

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function points(condition: boolean, value: number) {
  return condition ? value : 0;
}

function amountReason(card: DisplayCard) {
  if (!card.amount) return undefined;
  if (card.market === 'KR') return `거래대금 ${Math.round(card.amount / 100000000).toLocaleString()}억`;
  return `거래대금 ${Math.round(card.amount).toLocaleString()}`;
}

function labelNumber(card: DisplayCard, pattern: RegExp) {
  for (const label of [card.primaryReason, card.secondaryReason ?? '', ...card.labels]) {
    const match = label.match(pattern);
    if (match?.[1]) return Number(match[1]);
  }
  return undefined;
}

function getFeature(card: DisplayCard) {
  const t = card.technicalSnapshot;
  const theme = card.themeSnapshot;
  const risk = card.riskSnapshot;
  const changePct = card.changePct ?? 0;
  const volumeRatio = t?.timeAdjustedVolumeRatio ?? t?.volumeRatio20 ?? labelNumber(card, /거래량[^\d]*(\d+(?:\.\d+)?)배/) ?? 0;
  const amountRatio = t?.timeAdjustedAmountRatio ?? t?.amountRatio20 ?? labelNumber(card, /거래대금[^\d]*(\d+(?:\.\d+)?)배/) ?? 0;
  const distanceToPrevHighPct = t?.distanceToPrevHighPct ?? labelNumber(card, /전고점[^\d]*(\d+(?:\.\d+)?)%/);
  const intradayRangePct = t?.intradayRangePct ?? Math.abs(changePct);
  const gapPct = t?.gapPct ?? 0;
  const closeToHighPct = t?.closeToHighPct ?? (changePct >= 5 ? 85 : 0);
  const upperWickPct = risk?.upperWickPct ?? 0;
  const overheatScore = risk?.overheatScore ?? (changePct >= 25 ? 95 : changePct >= 15 ? 75 : changePct >= 10 ? 45 : 0);
  const isLowLiquidity = Boolean(risk?.isLowLiquidity || (!card.amount && card.market === 'KR') || card.labels.some((label) => /저유동성|거래부족/.test(label)));
  const isInvestmentWarning = Boolean(risk?.isInvestmentWarning || card.labels.some((label) => /투자주의|투자경고|관리종목|자본잠식/.test(label)));
  return {
    amountRankJump: t?.amountRankJump ?? 0,
    amountRankPct: t?.amountRankPct ?? (card.amount ? 70 : 0),
    amountRatio,
    boxBreakout: Boolean(t?.boxBreakout || card.labels.some((label) => /박스.*돌파/.test(label))),
    boxRangePct: t?.boxRangePct,
    breakout: Boolean(t?.breakoutLookbackDays || card.labels.some((label) => /신고가|돌파|고점 돌파/.test(label))),
    changePct,
    closeToHighPct,
    distanceToPrevHighPct,
    gapPct,
    hasAfterHours: Boolean((t?.afterHoursChangePct ?? 0) >= 3 || card.labels.some((label) => /시간외/.test(label))),
    intradayRangePct,
    isAboveMa5: Boolean(t?.isAboveMa5 || changePct > 0),
    isAboveVwap: Boolean(t?.isAboveVwap || card.labels.some((label) => /VWAP|고가권/.test(label))),
    isInvestmentWarning,
    isLowLiquidity,
    marketRelativeStrengthPct: t?.marketRelativeStrengthPct ?? 0,
    morningHighBreakout: Boolean(t?.morningHighBreakout),
    overheatScore,
    previousDayChangePct: t?.previousDayChangePct ?? 0,
    previousDayVolumeRatio20: t?.previousDayVolumeRatio20 ?? 0,
    pullbackDays: t?.pullbackDays ?? 0,
    pullbackDepthPct: t?.pullbackDepthPct ?? 0,
    themeAmountRatio: theme?.themeAmountRatio ?? 0,
    themeAvgChangePct: theme?.themeAvgChangePct ?? 0,
    themeBreadthUpCount: theme?.themeBreadthUpCount ?? (card.theme ? 1 : 0),
    themeTotalCount: theme?.themeTotalCount ?? (card.theme ? 1 : 0),
    themeVolumeRatio: theme?.themeVolumeRatio ?? 0,
    upperWickPct,
    volumeRatio,
    vwapReclaim: Boolean(t?.vwapReclaim),
    afternoonReacceleration: Boolean(t?.afternoonReacceleration),
  };
}

function riskTags(card: DisplayCard) {
  const f = getFeature(card);
  const tags: string[] = [];
  if (f.isInvestmentWarning) tags.push('투자주의/재무 위험 확인');
  if (f.isLowLiquidity) tags.push('저유동성 주의');
  if (f.upperWickPct >= 8) tags.push('윗꼬리 과다');
  if (f.overheatScore >= 70 || f.changePct >= 15) tags.push('과열 가능성');
  if (f.intradayRangePct >= 10) tags.push('장중 변동성 큼');
  return tags;
}

function riskPenalty(card: DisplayCard) {
  const f = getFeature(card);
  return points(f.isLowLiquidity, 12) + points(f.isInvestmentWarning, 18) + points(f.upperWickPct >= 8, 10) + points(f.overheatScore >= 75, 10);
}

function formatRatio(label: string, value: number) {
  return value > 0 ? `${label} ${value.toFixed(1)}배` : undefined;
}

function buildAlertLine(card: DisplayCard, reasons: string[]) {
  const core = reasons.slice(0, 2).join(' · ') || buildCardEvidenceLine(card);
  return `${card.name} 조건식 알림 · ${core}`;
}

function labelFor(score: number, riskOnly = false): FormulaFitLabel {
  if (riskOnly && score >= 50) return '위험 감시';
  if (score >= 80) return '가장 적합';
  if (score >= 58) return '관찰용';
  return '조건 부족';
}

function scoreFormula(card: DisplayCard, formula: FormulaDefinition): Omit<FormulaCandidate, 'formula' | 'phase'> {
  const f = getFeature(card);
  const penalty = riskPenalty(card);
  const matched: string[] = [];
  const missing: string[] = [];
  let score = 0;

  const addReason = (reason?: string) => {
    if (reason && !matched.includes(reason)) matched.push(reason);
  };
  const miss = (reason: string) => {
    if (!missing.includes(reason)) missing.push(reason);
  };

  if (formula.key === 'volume_spike') {
    score = clamp(f.volumeRatio * 12, 0, 35) + clamp(f.amountRatio * 10, 0, 25) + points(f.changePct >= 2, 15) + points(f.isAboveVwap, 10) + points(f.themeBreadthUpCount >= 3, 10) - penalty;
    addReason(formatRatio('거래량', f.volumeRatio));
    addReason(formatRatio('거래대금', f.amountRatio));
    addReason(f.isAboveVwap ? 'VWAP 위 유지' : undefined);
    if (f.volumeRatio < 1.5) miss('시간대 보정 거래량 부족');
    if (f.amountRatio < 1.5) miss('거래대금 배율 부족');
  } else if (formula.key === 'previous_high_approach') {
    score = points(f.distanceToPrevHighPct !== undefined && f.distanceToPrevHighPct >= 0 && f.distanceToPrevHighPct <= 3, 35) + points(f.volumeRatio >= 1.5, 20) + points(f.changePct > 0, 15) + points(f.isAboveMa5, 15) + points(f.isAboveVwap, 10) - penalty;
    addReason(f.distanceToPrevHighPct !== undefined && f.distanceToPrevHighPct >= 0 ? `전고점 ${f.distanceToPrevHighPct.toFixed(1)}% 근접` : undefined);
    addReason(formatRatio('거래량', f.volumeRatio));
    if (f.distanceToPrevHighPct === undefined) miss('전고점 거리 데이터 부족');
  } else if (formula.key === 'new_high_breakout') {
    score = points(f.breakout, 35) + points(f.volumeRatio >= 1.5, 20) + points(f.amountRankPct >= 60 || Boolean(card.amount), 15) + points(f.isAboveVwap, 15) + points(f.marketRelativeStrengthPct > 0, 10) - penalty;
    addReason(f.breakout ? (f.distanceToPrevHighPct !== undefined && f.distanceToPrevHighPct < 0 ? `20일 고점 ${Math.abs(f.distanceToPrevHighPct).toFixed(1)}% 돌파` : '20일 신고가 돌파') : undefined);
    addReason(formatRatio('거래량', f.volumeRatio));
    if (!f.breakout) miss('신고가 돌파 데이터 부족');
  } else if (formula.key === 'box_breakout') {
    score = points((f.boxRangePct ?? 99) <= 12, 25) + points(f.boxBreakout, 30) + points(f.volumeRatio >= 1.8, 20) + points(f.isAboveVwap, 15) - penalty;
    addReason(f.boxBreakout ? '박스권 상단 돌파' : undefined);
    addReason(f.boxRangePct ? `20일 박스폭 ${f.boxRangePct.toFixed(1)}%` : undefined);
    if (!f.boxBreakout) miss('박스권 돌파 데이터 부족');
  } else if (formula.key === 'pullback_rebreak') {
    score = points(f.pullbackDepthPct <= -5 && f.pullbackDepthPct >= -15, 25) + points(f.pullbackDays >= 2 && f.pullbackDays <= 7, 20) + points(f.isAboveMa5, 15) + points(f.breakout, 15) + points(f.volumeRatio >= 1.5, 15) - penalty;
    addReason(f.pullbackDays ? `조정 ${f.pullbackDays}일 후 재상승` : undefined);
    addReason(f.isAboveMa5 ? '5일선 재상향' : undefined);
    if (!f.pullbackDays) miss('눌림 기간 데이터 부족');
  } else if (formula.key === 'follow_through_bull_candle') {
    score = points(f.previousDayChangePct >= 8, 30) + points(f.previousDayVolumeRatio20 >= 3, 25) + points(f.changePct >= -3, 15) + points(f.isAboveVwap, 15) + points(f.volumeRatio >= 1.2, 10) - penalty;
    addReason(f.previousDayChangePct ? `전일 +${f.previousDayChangePct.toFixed(1)}%` : undefined);
    addReason(formatRatio('오늘 거래량', f.volumeRatio));
    if (!f.previousDayChangePct) miss('전일 장대양봉 데이터 부족');
  } else if (formula.key === 'theme_breadth') {
    const breadthPct = f.themeTotalCount ? (f.themeBreadthUpCount / f.themeTotalCount) * 100 : 0;
    score = points(f.themeBreadthUpCount >= 5, 25) + points(breadthPct >= 40, 20) + points(f.themeAvgChangePct >= 2, 15) + clamp(f.themeAmountRatio * 10, 0, 20) + points(f.changePct >= f.themeAvgChangePct, 10) - penalty / 2;
    addReason(f.themeBreadthUpCount ? `테마 ${f.themeBreadthUpCount}종목 상승` : undefined);
    addReason(formatRatio('테마 거래대금', f.themeAmountRatio));
    if (f.themeBreadthUpCount < 3) miss('테마 동반 상승 데이터 부족');
  } else if (formula.key === 'risk_watch') {
    score = points(f.changePct >= 15, 22) + points(f.volumeRatio >= 5, 22) + points(f.intradayRangePct >= 10, 18) + points(f.gapPct >= 10, 12) + points(f.isInvestmentWarning, 20) + points(f.isLowLiquidity, 8);
    addReason(f.changePct >= 10 ? `당일 +${f.changePct.toFixed(1)}%` : undefined);
    addReason(formatRatio('거래량', f.volumeRatio));
    addReason(f.intradayRangePct >= 8 ? `장중 변동폭 ${f.intradayRangePct.toFixed(1)}%` : undefined);
    if (!matched.length) miss('뚜렷한 위험 태그 부족');
  } else if (formula.key === 'opening_gap_hold') {
    score = points(f.gapPct >= 3, 30) + points(f.changePct >= f.gapPct - 1, 20) + points(f.isAboveVwap, 20) + points(f.volumeRatio >= 2, 20) - penalty;
    addReason(f.gapPct ? `시초 갭 +${f.gapPct.toFixed(1)}%` : undefined);
    addReason(f.isAboveVwap ? 'VWAP 위 유지' : undefined);
    if (f.gapPct < 3) miss('시초 갭 데이터 부족');
  } else if (formula.key === 'morning_high_rebreak') {
    score = points(f.morningHighBreakout, 40) + points(f.volumeRatio >= 1.8, 25) + points(f.isAboveVwap, 20) + points(f.changePct > 0, 10) - penalty;
    addReason(f.morningHighBreakout ? '오전 고점 재돌파' : undefined);
    addReason(formatRatio('재돌파 거래량', f.volumeRatio));
    if (!f.morningHighBreakout) miss('오전 고점 재돌파 데이터 부족');
  } else if (formula.key === 'vwap_reclaim') {
    score = points(f.vwapReclaim, 40) + points(f.isAboveVwap, 20) + points(f.volumeRatio >= 1.5, 20) + points(f.changePct > 0, 10) - penalty;
    addReason(f.vwapReclaim || f.isAboveVwap ? 'VWAP 재장악' : undefined);
    addReason(formatRatio('거래량', f.volumeRatio));
    if (!f.vwapReclaim) miss('VWAP 재장악 데이터 부족');
  } else if (formula.key === 'amount_rank_jump') {
    score = points(f.amountRankPct >= 80, 25) + points(f.amountRankJump >= 200, 25) + clamp(f.amountRatio * 10, 0, 25) + points(f.changePct > 2, 15) - penalty;
    addReason(f.amountRankPct >= 70 ? '거래대금 상위권 진입' : undefined);
    addReason(f.amountRankJump ? `거래대금 순위 ${Math.round(f.amountRankJump)}계단 상승` : undefined);
    if (!f.amountRankJump) miss('거래대금 순위 변화 데이터 부족');
  } else if (formula.key === 'market_relative_strength') {
    score = points(f.changePct >= 3, 25) + points(f.marketRelativeStrengthPct >= 4, 35) + points(f.volumeRatio >= 1.5, 20) - penalty;
    addReason(f.marketRelativeStrengthPct ? `시장 대비 상대강도 +${f.marketRelativeStrengthPct.toFixed(1)}%` : undefined);
    addReason(formatRatio('거래량', f.volumeRatio));
    if (!f.marketRelativeStrengthPct) miss('시장 상대강도 데이터 부족');
  } else if (formula.key === 'afternoon_reacceleration') {
    score = points(f.afternoonReacceleration, 40) + points(f.isAboveVwap, 20) + points(f.volumeRatio >= 1.5, 20) + points(f.changePct > 3, 10) - penalty;
    addReason(f.afternoonReacceleration ? '오후 재가속' : undefined);
    addReason(f.isAboveVwap ? 'VWAP 위 회복' : undefined);
    if (!f.afternoonReacceleration) miss('오후 재가속 데이터 부족');
  } else if (formula.key === 'limit_up_watch') {
    score = points(f.changePct >= 25, 40) + points(f.closeToHighPct >= 99, 20) + points(f.volumeRatio >= 3, 20) + points(f.intradayRangePct >= 10, 10);
    addReason(f.changePct >= 20 ? `당일 +${f.changePct.toFixed(1)}%` : undefined);
    addReason(f.closeToHighPct ? '상한가 근접 고가권' : undefined);
    if (f.changePct < 25) miss('상한가 근접 조건 부족');
  } else if (formula.key === 'after_hours_follow_through') {
    score = points(f.hasAfterHours, 30) + points((card.technicalSnapshot?.afterHoursChangePct ?? 0) >= 3, 20) + points(f.changePct >= 0, 15) + points(f.volumeRatio >= 1.5, 20) - penalty;
    addReason(card.technicalSnapshot?.afterHoursChangePct ? `전일 시간외 +${card.technicalSnapshot.afterHoursChangePct.toFixed(1)}%` : undefined);
    addReason(formatRatio('장중 거래량', f.volumeRatio));
    if (!f.hasAfterHours) miss('시간외 데이터 부족');
  }

  const bounded = Math.round(clamp(score));
  const tags = riskTags(card);
  return {
    fitScore: bounded,
    fitLabel: labelFor(bounded, formula.phase === '위험감시'),
    matchedReasons: matched.length ? matched.slice(0, 4) : [buildCardEvidenceLine(card)],
    missingReasons: missing.length ? missing.slice(0, 3) : undefined,
    riskTags: tags.length ? tags.slice(0, 3) : undefined,
    alertLine: buildAlertLine(card, matched),
  };
}

export function getFormulaCandidatesForCard(card: DisplayCard): FormulaCandidate[] {
  return definitions
    .map((formula) => ({
      formula,
      phase: formula.phase,
      ...scoreFormula(card, formula),
    }))
    .sort((a, b) => {
      const riskA = a.formula.phase === '위험감시';
      const riskB = b.formula.phase === '위험감시';
      if (riskA !== riskB && (card.riskSnapshot?.isInvestmentWarning || card.riskSnapshot?.isLowLiquidity)) return riskA ? -1 : 1;
      return b.fitScore - a.fitScore;
    });
}

export function getPrimaryFormulaForCard(card: DisplayCard): FormulaDefinition {
  return getFormulaCandidatesForCard(card)[0]?.formula ?? formulaCatalog.volume_spike;
}

export function getFormulaForCard(card: DisplayCard): FormulaDefinition {
  return getPrimaryFormulaForCard(card);
}

export function buildCardEvidenceLine(card: DisplayCard) {
  const f = getFeature(card);
  const parts = [
    formatRatio('거래량', f.volumeRatio),
    formatRatio('거래대금', f.amountRatio),
    f.distanceToPrevHighPct !== undefined && f.distanceToPrevHighPct >= 0 ? `전고점 ${f.distanceToPrevHighPct.toFixed(1)}% 근접` : undefined,
    f.distanceToPrevHighPct !== undefined && f.distanceToPrevHighPct < 0 ? `20일 고점 ${Math.abs(f.distanceToPrevHighPct).toFixed(1)}% 돌파` : undefined,
    f.themeBreadthUpCount >= 3 ? `테마 ${f.themeBreadthUpCount}종목 상승` : undefined,
    f.isAboveVwap ? 'VWAP 위 유지' : undefined,
    typeof card.changePct === 'number' ? `${card.changePct > 0 ? '+' : ''}${card.changePct.toFixed(2)}%` : undefined,
    amountReason(card),
  ].filter(Boolean) as string[];
  return parts.length ? parts.slice(0, 3).join(' · ') : card.primaryReason || card.dataBasisLabel;
}

export function formatFormulaCopy(card: DisplayCard, formula: FormulaDefinition) {
  return [
    `조건식: ${formula.name}`,
    `종목: ${card.name}(${card.symbol})`,
    `단계: ${formula.phase}`,
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
