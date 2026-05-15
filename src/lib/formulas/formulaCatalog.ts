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

export const formulaCatalog: Record<string, FormulaDefinition> = {
  kr_gainer: {
    key: 'kr_gainer_volume_price',
    name: '거래량 증가 + 가격 상승 조건',
    shortName: '거래량 증가',
    cardLabel: '거래량 폭발형',
    userIntent: '거래량이 붙고 가격이 따라붙는 종목을 다시 확인하기 위한 조건',
    alertPreviewTemplate: '{name} 조건식 알림 · {reason}',
    description: '가격 상승과 거래량 또는 거래대금 증가가 함께 확인된 종목을 보여주는 조건입니다.',
    criteria: ['전일 대비 상승 데이터 확인', '거래량 또는 거래대금 데이터 확인', '공식 API/DB/위젯 기준 데이터 사용'],
    excludeRules: ['거래정지 종목 제외', '표시 가능한 공식 데이터가 없는 종목 제외', '조건 충족만 표시하며 방향성을 단정하지 않음'],
    defaultExpiresInDays: 7,
    riskNote: '단기 변동성이 큰 구간일 수 있으므로 매수·매도 판단은 이용자가 직접 해야 합니다.',
  },
  kr_loser: {
    key: 'kr_loser_watch',
    name: '하락 + 거래 데이터 확인 조건',
    shortName: '하락 확인',
    cardLabel: '하락 관찰형',
    userIntent: '하락 구간에서 거래 데이터가 다시 변하는지 관찰하기 위한 조건',
    alertPreviewTemplate: '{name} 조건식 알림 · {reason}',
    description: '공식 가격 데이터에서 하락과 거래 데이터가 확인된 종목을 관찰용으로 보여주는 조건입니다.',
    criteria: ['전일 대비 하락 데이터 확인', '거래량 또는 거래대금 데이터 확인'],
    excludeRules: ['가격 데이터가 없는 종목 제외', '하락 이유를 앱이 단정하지 않음'],
    defaultExpiresInDays: 7,
    riskNote: '하락 데이터는 위험 신호일 수 있으며 매수·매도 판단은 이용자가 직접 해야 합니다.',
  },
  kr_volume: {
    key: 'kr_volume_amount_spike',
    name: '거래대금 증가 조건',
    shortName: '거래대금 증가',
    cardLabel: '거래대금 집중형',
    userIntent: '거래대금이 커진 종목을 다시 확인하기 위한 조건',
    alertPreviewTemplate: '{name} 조건식 알림 · {reason}',
    description: '거래량이나 거래대금이 확인 가능한 기준보다 커진 종목을 보여주는 조건입니다.',
    criteria: ['거래량 또는 거래대금 데이터 확인', '최근 가격 데이터 확인', '데이터 출처와 기준 시점 표시'],
    excludeRules: ['거래 데이터가 없는 종목 제외', '거래대금 증가를 호재로 단정하지 않음'],
    defaultExpiresInDays: 7,
    riskNote: '거래대금 증가는 관심 증가의 참고 지표이며 결과를 보장하지 않습니다.',
  },
  kr_disclosure: {
    key: 'kr_disclosure_event',
    name: '공시 발생 조건',
    shortName: '공시 발생',
    cardLabel: '공시 이벤트형',
    userIntent: '공시가 발생한 종목을 다시 확인하기 위한 조건',
    alertPreviewTemplate: '{name} 조건식 알림 · 공시/이벤트 데이터 확인',
    description: 'OpenDART 또는 공식 공시 데이터가 확인된 종목을 보여주는 조건입니다.',
    criteria: ['OpenDART 또는 공식 공시 데이터 확인', '종목 라벨에 공시/이벤트성 데이터 포함'],
    excludeRules: ['공시 내용의 투자 영향을 앱이 판단하지 않음', '원문 확인 없이 호재·악재를 단정하지 않음'],
    defaultExpiresInDays: 7,
    riskNote: '공시의 의미와 투자 판단은 이용자가 직접 확인해야 합니다.',
  },
  kr_news: {
    key: 'kr_news_mention',
    name: '뉴스 관심 발생 조건',
    shortName: '뉴스 발생',
    cardLabel: '뉴스 포착형',
    userIntent: '뉴스나 이슈가 확인된 종목을 다시 확인하기 위한 조건',
    alertPreviewTemplate: '{name} 조건식 알림 · 뉴스/이슈 데이터 확인',
    description: '뉴스 검색 또는 뉴스 라벨이 확인된 종목을 보여주는 조건입니다.',
    criteria: ['뉴스 제목/링크 데이터 확인', '뉴스 라벨 또는 검색 결과 존재'],
    excludeRules: ['뉴스 원문 본문 재게시 금지', '뉴스 내용을 호재·악재로 단정하지 않음'],
    defaultExpiresInDays: 7,
    riskNote: '뉴스는 사실 확인과 맥락 확인이 필요합니다.',
  },
  chart_setup: {
    key: 'chart_setup_detected',
    name: '차트자리 조건',
    shortName: '차트자리',
    cardLabel: '차트자리형',
    userIntent: '가격·거래량 조건이 다시 나타나는지 확인하기 위한 조건',
    alertPreviewTemplate: '{name} 조건식 알림 · 차트자리 데이터 확인',
    description: '가격·거래량 데이터가 충분할 때 차트자리 라벨을 보여주는 조건입니다.',
    criteria: ['차트자리 라벨 존재', '가격 또는 거래량 데이터 확인'],
    excludeRules: ['라벨이 없는 종목 제외', '차트 조건만으로 결과를 단정하지 않음'],
    defaultExpiresInDays: 14,
    riskNote: '차트 조건은 과거 패턴 참고용이며 결과를 보장하지 않습니다.',
  },
  crypto_gainer_24h: {
    key: 'crypto_24h_price_volume',
    name: '코인 24h 가격 + 거래량 조건',
    shortName: '24h 가격·거래량',
    cardLabel: '24h 변동형',
    userIntent: '24시간 가격과 거래량 변화가 큰 코인을 다시 확인하기 위한 조건',
    alertPreviewTemplate: '{name} 조건식 알림 · {reason}',
    description: '코인 public API에서 24시간 가격 변화와 거래량이 확인된 종목을 보여주는 조건입니다.',
    criteria: ['24h 가격 변화 확인', '24h 거래량 또는 거래대금 확인', 'Binance/Upbit 등 public API 기준'],
    excludeRules: ['거래량 데이터가 없는 코인 제외', '변동성만으로 방향성을 단정하지 않음'],
    defaultExpiresInDays: 3,
    riskNote: '코인은 변동성이 크며 조건 충족은 결과를 보장하지 않습니다.',
  },
  crypto_loser_24h: {
    key: 'crypto_24h_downside',
    name: '코인 24h 하락 + 거래량 조건',
    shortName: '24h 하락 관찰',
    cardLabel: '24h 하락형',
    userIntent: '24시간 하락 구간에서 거래량 변화를 관찰하기 위한 조건',
    alertPreviewTemplate: '{name} 조건식 알림 · {reason}',
    description: '코인 public API에서 24시간 하락과 거래량이 확인된 종목을 관찰용으로 보여주는 조건입니다.',
    criteria: ['24h 하락 데이터 확인', '24h 거래량 또는 거래대금 확인'],
    excludeRules: ['거래량 데이터가 없는 코인 제외', '하락 이유를 앱이 단정하지 않음'],
    defaultExpiresInDays: 3,
    riskNote: '하락 데이터는 위험 신호일 수 있으며 매수·매도 판단은 이용자가 직접 해야 합니다.',
  },
  us_widget: {
    key: 'us_widget_sec_event',
    name: '미장 위젯/공시 확인 조건',
    shortName: '미장 확인',
    cardLabel: '미장 이벤트형',
    userIntent: 'TradingView 위젯과 SEC 이벤트 기준으로 미장 종목을 확인하기 위한 조건',
    alertPreviewTemplate: '{name} 조건식 알림 · TradingView/SEC 기준 확인',
    description: '미장 종목은 공식 위젯 또는 SEC/직접 가격 API 기준으로 확인합니다.',
    criteria: ['TradingView 위젯 또는 허가된 직접 가격 API 기준', 'SEC/뉴스/가격 라벨 중 하나 이상 확인'],
    excludeRules: ['직접 가격 API가 없으면 자체 등락률을 만들지 않음', '위젯 데이터를 추출하지 않음'],
    defaultExpiresInDays: 7,
    riskNote: '외부 위젯과 공시 데이터는 지연될 수 있습니다.',
  },
};

function hasLabel(card: DisplayCard, keyword: string) {
  return card.labels.some((label) => label.includes(keyword));
}

function amountReason(card: DisplayCard) {
  if (!card.amount) return undefined;
  if (card.market === 'KR') return `거래대금 ${Math.round(card.amount / 100000000).toLocaleString()}억`;
  return `거래대금 ${Math.round(card.amount).toLocaleString()}`;
}

export function buildCardEvidenceLine(card: DisplayCard) {
  const parts: string[] = [];
  if (typeof card.changePct === 'number') parts.push(`${card.changePct > 0 ? '+' : ''}${card.changePct.toFixed(2)}%`);
  const amount = amountReason(card);
  if (amount) parts.push(amount);
  if (card.chartSetupType) parts.push('차트자리 확인');
  const importantLabel = card.labels.find((label) => /거래|뉴스|공시|SEC|공포|탐욕|차트/.test(label));
  if (importantLabel) parts.push(importantLabel);
  return parts.length ? parts.slice(0, 3).join(' · ') : card.primaryReason || card.dataBasisLabel;
}

export function getPrimaryFormulaForCard(card: DisplayCard): FormulaDefinition {
  if (card.chartSetupType || hasLabel(card, '차트자리')) return formulaCatalog.chart_setup;
  if (card.cardType in formulaCatalog) return formulaCatalog[card.cardType];
  if (hasLabel(card, '공시')) return formulaCatalog.kr_disclosure;
  if (hasLabel(card, '뉴스')) return formulaCatalog.kr_news;
  if (card.market === 'CRYPTO') return (card.changePct ?? 0) < 0 ? formulaCatalog.crypto_loser_24h : formulaCatalog.crypto_gainer_24h;
  if (card.market === 'US') return formulaCatalog.us_widget;
  if ((card.amount ?? 0) > 0) return formulaCatalog.kr_volume;
  return (card.changePct ?? 0) < 0 ? formulaCatalog.kr_loser : formulaCatalog.kr_gainer;
}

export function getFormulaCandidatesForCard(card: DisplayCard): FormulaCandidate[] {
  const candidates: FormulaCandidate[] = [];
  const push = (formula: FormulaDefinition, fitScore: number, fitLabel: FormulaFitLabel, matchedReasons: string[], missingReasons?: string[], riskTags?: string[]) => {
    if (!candidates.some((candidate) => candidate.formula.key === formula.key)) {
      candidates.push({ formula, fitScore, fitLabel, matchedReasons, missingReasons, riskTags });
    }
  };

  const evidence = buildCardEvidenceLine(card);
  const hasAmount = Boolean(card.amount || card.volume);
  const isUp = (card.changePct ?? 0) > 0;
  const isDown = (card.changePct ?? 0) < 0;

  if (card.chartSetupType || hasLabel(card, '차트자리')) {
    push(formulaCatalog.chart_setup, 92, '지금 가장 잘 맞음', ['차트자리 라벨 확인', evidence], undefined, ['차트 조건은 참고용']);
  }
  if (hasLabel(card, '공시') || card.cardType.includes('disclosure')) {
    push(formulaCatalog.kr_disclosure, 88, '지금 가장 잘 맞음', ['공시/이벤트 라벨 확인'], undefined, ['공시 원문 확인 필요']);
  }
  if (hasLabel(card, '뉴스') || card.cardType.includes('news')) {
    push(formulaCatalog.kr_news, 82, '관찰용', ['뉴스/이슈 라벨 확인'], ['뉴스 증가율은 데이터 누적 후 계산'], ['뉴스 맥락 확인 필요']);
  }
  if (card.market === 'CRYPTO') {
    push(isDown ? formulaCatalog.crypto_loser_24h : formulaCatalog.crypto_gainer_24h, hasAmount ? 86 : 74, hasAmount ? '지금 가장 잘 맞음' : '관찰용', ['24h 가격 데이터 확인', evidence], hasAmount ? undefined : ['거래량 데이터 부족'], ['코인 변동성 유의']);
  } else if (card.market === 'US') {
    push(formulaCatalog.us_widget, 78, '관찰용', ['TradingView/SEC 기준 확인'], ['직접 가격 API가 없으면 자체 등락률 없음'], ['외부 위젯 지연 가능']);
  } else {
    push(isDown ? formulaCatalog.kr_loser : formulaCatalog.kr_gainer, isUp && hasAmount ? 90 : 76, isUp && hasAmount ? '지금 가장 잘 맞음' : '관찰용', [evidence], hasAmount ? undefined : ['거래량/거래대금 데이터 부족']);
    if (hasAmount) push(formulaCatalog.kr_volume, 84, '관찰용', ['거래량 또는 거래대금 데이터 확인'], undefined, ['관심 증가 참고 지표']);
  }

  push(formulaCatalog.chart_setup, card.chartSetupType ? 80 : 52, card.chartSetupType ? '관찰용' : '조건 부족', card.chartSetupType ? ['차트자리 라벨 확인'] : [], card.chartSetupType ? undefined : ['차트자리 라벨 부족']);

  return candidates.sort((a, b) => b.fitScore - a.fitScore).slice(0, 4);
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
    '본 조건식은 매수·매도 추천이 아닌 참고용 조건입니다.',
  ].join('\n');
}
