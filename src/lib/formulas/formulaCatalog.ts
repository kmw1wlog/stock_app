import type { DisplayCard } from '@/lib/marketDataTypes';

export type FormulaDefinition = {
  key: string;
  name: string;
  shortName: string;
  description: string;
  criteria: string[];
  excludeRules: string[];
  defaultExpiresInDays: number;
  riskNote: string;
};

export const formulaCatalog: Record<string, FormulaDefinition> = {
  kr_gainer: {
    key: 'kr_gainer_volume_price',
    name: '거래량 증가 + 가격 상승 조건',
    shortName: '거래량 증가',
    description: '가격 상승과 거래량 또는 거래대금 증가가 함께 확인된 종목을 보여주는 조건입니다.',
    criteria: ['전일 대비 상승 데이터 확인', '거래량 또는 거래대금 데이터 확인', '공식 API/DB/위젯 기준 데이터 사용'],
    excludeRules: ['거래정지 종목 제외', '표시 가능한 공식 데이터가 없는 종목 제외'],
    defaultExpiresInDays: 7,
    riskNote: '단기 변동성이 큰 구간일 수 있으므로 매수·매도 판단은 이용자가 직접 해야 합니다.',
  },
  kr_loser: {
    key: 'kr_loser_watch',
    name: '가격 하락 + 거래 데이터 확인 조건',
    shortName: '하락 확인',
    description: '공식 가격 데이터에서 하락과 거래 데이터가 확인된 종목을 보여주는 조건입니다.',
    criteria: ['전일 대비 하락 데이터 확인', '거래량 또는 거래대금 데이터 확인'],
    excludeRules: ['가격 데이터가 없는 종목 제외', '하락 사유를 앱이 단정하지 않음'],
    defaultExpiresInDays: 7,
    riskNote: '하락 데이터는 위험 신호일 수 있으며 투자 판단은 이용자가 직접 해야 합니다.',
  },
  kr_disclosure: {
    key: 'kr_disclosure_event',
    name: '공시 발생 조건',
    shortName: '공시 발생',
    description: '공시 또는 주요 이벤트 라벨이 확인된 종목을 보여주는 조건입니다.',
    criteria: ['OpenDART 또는 공식 공시 데이터 확인', '종목 라벨에 공시/이벤트성 데이터 포함'],
    excludeRules: ['공시 내용의 투자 영향을 앱이 판단하지 않음'],
    defaultExpiresInDays: 7,
    riskNote: '공시의 의미와 투자 판단은 이용자가 직접 확인해야 합니다.',
  },
  kr_news: {
    key: 'kr_news_mention',
    name: '뉴스 관심 발생 조건',
    shortName: '뉴스 발생',
    description: '뉴스 검색 또는 뉴스 라벨이 확인된 종목을 보여주는 조건입니다.',
    criteria: ['뉴스 제목/링크 데이터 확인', '뉴스 라벨 또는 검색 결과 존재'],
    excludeRules: ['뉴스 원문 본문 재게시 금지', '뉴스 내용의 호재/악재 단정 금지'],
    defaultExpiresInDays: 7,
    riskNote: '뉴스는 사실 확인과 맥락 확인이 필요합니다.',
  },
  chart_setup: {
    key: 'chart_setup_detected',
    name: '차트자리 조건',
    shortName: '차트자리',
    description: '가격·거래량 데이터가 충분할 때 차트자리 라벨을 보여주는 조건입니다.',
    criteria: ['차트자리 라벨 존재', '가격 또는 거래량 데이터 확인'],
    excludeRules: ['라벨이 없는 종목 제외'],
    defaultExpiresInDays: 14,
    riskNote: '차트 조건은 과거 패턴 참고용이며 결과를 약속하지 않습니다.',
  },
  crypto_gainer_24h: {
    key: 'crypto_24h_price_volume',
    name: '코인 24h 가격 + 거래량 조건',
    shortName: '24h 관찰',
    description: '코인 public API에서 24시간 가격 변화와 거래량이 확인된 종목을 보여주는 조건입니다.',
    criteria: ['24h 가격 변화 확인', '24h 거래량 또는 거래대금 확인', 'Binance/Upbit 등 public API 기준'],
    excludeRules: ['거래량 데이터가 없는 코인 제외'],
    defaultExpiresInDays: 3,
    riskNote: '코인은 변동성이 크므로 조건 충족이 결과를 약속하지 않습니다.',
  },
  crypto_loser_24h: {
    key: 'crypto_24h_downside',
    name: '코인 24h 하락 + 거래량 조건',
    shortName: '24h 하락',
    description: '코인 public API에서 24시간 하락과 거래량이 확인된 종목을 보여주는 조건입니다.',
    criteria: ['24h 하락 데이터 확인', '24h 거래량 또는 거래대금 확인'],
    excludeRules: ['거래량 데이터가 없는 코인 제외'],
    defaultExpiresInDays: 3,
    riskNote: '하락 데이터는 위험 신호일 수 있으며 매수·매도 판단은 이용자가 직접 해야 합니다.',
  },
  us_widget: {
    key: 'us_widget_sec_event',
    name: '미장 위젯/공시 확인 조건',
    shortName: '미장 확인',
    description: '미장 종목은 공식 위젯 또는 SEC/직접 가격 API 기준으로 확인합니다.',
    criteria: ['TradingView 위젯 또는 허가된 직접 가격 API 기준', 'SEC/뉴스/가격 라벨 중 하나 이상 확인'],
    excludeRules: ['직접 가격 API가 없으면 자체 등락률을 만들지 않음'],
    defaultExpiresInDays: 7,
    riskNote: '외부 위젯과 공시 데이터는 지연될 수 있습니다.',
  },
};

export function getFormulaForCard(card: DisplayCard): FormulaDefinition {
  if (card.chartSetupType || card.labels.some((label) => label.includes('차트자리'))) return formulaCatalog.chart_setup;
  if (card.cardType in formulaCatalog) return formulaCatalog[card.cardType];
  if (card.labels.some((label) => label.includes('공시'))) return formulaCatalog.kr_disclosure;
  if (card.labels.some((label) => label.includes('뉴스'))) return formulaCatalog.kr_news;
  if (card.market === 'CRYPTO') return formulaCatalog.crypto_gainer_24h;
  if (card.market === 'US') return formulaCatalog.us_widget;
  return formulaCatalog.kr_gainer;
}

export function formatFormulaCopy(card: DisplayCard, formula: FormulaDefinition) {
  return [
    `조건식: ${formula.name}`,
    `종목: ${card.name}(${card.symbol})`,
    '기준:',
    ...formula.criteria.map((item, index) => `${index + 1}. ${item}`),
    '',
    '제외/주의 기준:',
    ...formula.excludeRules.map((item, index) => `${index + 1}. ${item}`),
    '',
    '본 조건식은 매수·매도 추천이 아닌 참고용 조건입니다.',
  ].join('\n');
}
