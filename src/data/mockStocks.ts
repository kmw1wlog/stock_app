import type { MarketType } from '@/lib/display/displayPolicy';

export type FomoType =
  | 'data_signal'
  | 'price_move'
  | 'volume_move'
  | 'chart_setup'
  | 'news_event'
  | 'disclosure_event'
  | 'market_sentiment';

export type StockCard = {
  id: string;
  marketType: MarketType;
  symbol: string;
  tvSymbol?: string;
  coingeckoId?: string;
  cmcId?: string;
  dataBasisLabel: string;
  coreLabels: string[];
  name: string;
  theme: string;
  market: '국장' | '미장' | '코인';
  style: '관찰' | '공격' | '보수';
  titleReason: string;
  subReason: string;
  priceChangeRate: number;
  volumeAmountText: string;
  saveTrend: '증가' | '보통' | '감소';
  riskLevel: '낮음' | '중간' | '높음';
  socialProof: string;
  tags: string[];
  accent: 'blue' | 'green' | 'orange' | 'violet';
  fomoType: FomoType;
  chartSetupType: string;
  chartSetupDescription: string;
  fomoHeadline: string;
  fomoSubtext: string;
  fomoMetric?: string;
  fomoCta?: string;
  sourceLabel?: string;
  fomoSignals: Array<{ label: string; value: string }>;
  savedListCopy: string;
  diagnosis: {
    score: number;
    monthChange: string;
    leader: string;
    supplyStars: number;
    finance: string;
    valuation: string;
    sectorMomentum: string;
    atr: string;
    volume: string;
    shortSelling: string;
  };
  formula: {
    yesTrader: string[];
    kiwoom: string[];
    tradingView: string[];
    indicator: string[];
  };
};

const commonFormula = {
  yesTrader: ['거래대금 > 300억', '종가 > 20일 이동평균', '전일 대비 등락률 > 3'],
  kiwoom: ['거래량 전일 대비 150% 이상', '20일선 회복', '공시/뉴스 키워드 확인'],
  tradingView: ['close > ta.sma(close, 20)', 'volume > ta.sma(volume, 20) * 1.5'],
  indicator: ['가격, 거래량, 공시/뉴스 기준을 함께 확인'],
};

export const stockCards: StockCard[] = [
  {
    id: 'rainbow-robotics',
    marketType: 'KR',
    symbol: '277810',
    tvSymbol: 'KRX:277810',
    dataBasisLabel: '개발 mock · DATA_MODE=mock 전용',
    coreLabels: ['전일 대비 상승 후보', '거래대금 확인 필요', '차트자리 후보'],
    name: '레인보우로보틱스',
    theme: '로봇',
    market: '국장',
    style: '관찰',
    titleReason: '20일선 회복 + 거래대금 유입 후보',
    subReason: '실제 배포 모드에서는 DB/API 데이터가 있을 때만 가격과 등락률을 표시합니다.',
    priceChangeRate: 0,
    volumeAmountText: '개발 샘플',
    saveTrend: '보통',
    riskLevel: '중간',
    socialProof: '공식 데이터 기준으로 포착된 후보입니다.',
    tags: ['오늘 급등', '차트자리', '뉴스·공시'],
    accent: 'blue',
    fomoType: 'chart_setup',
    chartSetupType: '20일선 회복 + 거래대금 유입',
    chartSetupDescription: '가격과 거래량 데이터가 있을 때 계산 가능한 차트자리입니다.',
    fomoHeadline: '공식 데이터 기준 후보',
    fomoSubtext: 'mock 모드에서만 보이는 개발 샘플입니다.',
    fomoMetric: '데이터 확인',
    fomoCta: '상세 보기',
    sourceLabel: '개발 mock',
    fomoSignals: [
      { label: '가격 기준', value: 'Data.go.kr EOD 데이터가 필요합니다.' },
      { label: '뉴스 기준', value: 'Naver Search API 결과가 있으면 표시합니다.' },
      { label: '공시 기준', value: 'OpenDART 공시가 있으면 표시합니다.' },
    ],
    savedListCopy: '현재 데이터 기준으로 다시 확인할 후보',
    diagnosis: {
      score: 70,
      monthChange: '데이터 필요',
      leader: '자료 준비중',
      supplyStars: 3,
      finance: '공시 확인 필요',
      valuation: '자료 준비중',
      sectorMomentum: '로봇 테마',
      atr: '자료 준비중',
      volume: '거래량 데이터 필요',
      shortSelling: 'KRX 자료 준비중',
    },
    formula: commonFormula,
  },
  {
    id: 'nvidia-widget',
    marketType: 'US',
    symbol: 'NVDA',
    tvSymbol: 'NASDAQ:NVDA',
    dataBasisLabel: 'TradingView 위젯 기준 · SEC EDGAR 기준',
    coreLabels: ['TradingView 위젯', 'SEC 공시 확인', '직접 가격 API 미사용'],
    name: 'NVIDIA',
    theme: 'AI·반도체',
    market: '미장',
    style: '관찰',
    titleReason: 'TradingView 위젯과 SEC 공시로 확인하는 미장 후보',
    subReason: '직접 가격 API가 없으면 앱 내부에서 등락률을 계산하지 않습니다.',
    priceChangeRate: 0,
    volumeAmountText: '위젯 기준',
    saveTrend: '보통',
    riskLevel: '중간',
    socialProof: 'SEC EDGAR와 TradingView 기준으로 확인합니다.',
    tags: ['미장 이벤트', 'SEC', 'TradingView'],
    accent: 'violet',
    fomoType: 'disclosure_event',
    chartSetupType: '위젯 차트 확인',
    chartSetupDescription: '미장 상세 차트는 TradingView Advanced Chart 위젯으로 표시합니다.',
    fomoHeadline: 'SEC 이벤트 확인',
    fomoSubtext: '공시가 있으면 EDGAR 기준으로 표시합니다.',
    fomoMetric: 'SEC',
    fomoCta: '공시 보기',
    sourceLabel: 'SEC EDGAR',
    fomoSignals: [
      { label: '가격', value: 'TradingView 위젯 기준으로 표시합니다.' },
      { label: '공시', value: 'SEC EDGAR company submissions를 조회합니다.' },
      { label: '직접 등락률', value: '직접 가격 API 없이는 계산하지 않습니다.' },
    ],
    savedListCopy: 'SEC 이벤트와 위젯 차트를 함께 확인',
    diagnosis: {
      score: 65,
      monthChange: '위젯 기준',
      leader: 'SEC 이벤트 확인',
      supplyStars: 3,
      finance: 'SEC 공시 기준',
      valuation: '자료 준비중',
      sectorMomentum: 'AI·반도체',
      atr: '직접 API 필요',
      volume: '위젯 기준',
      shortSelling: '자료 준비중',
    },
    formula: commonFormula,
  },
  {
    id: 'bitcoin-public-api',
    marketType: 'CRYPTO',
    symbol: 'BTCUSDT',
    tvSymbol: 'BINANCE:BTCUSDT',
    coingeckoId: 'bitcoin',
    dataBasisLabel: '24h 기준 · Binance/Upbit public API',
    coreLabels: ['24h 가격', '거래량', '캔들'],
    name: 'Bitcoin',
    theme: '대형코인',
    market: '코인',
    style: '관찰',
    titleReason: 'Binance/Upbit public API로 확인하는 코인 후보',
    subReason: '코인은 public API 기준으로 가격, 24h 등락률, 거래량과 캔들을 저장합니다.',
    priceChangeRate: 0,
    volumeAmountText: 'API 기준',
    saveTrend: '보통',
    riskLevel: '중간',
    socialProof: 'Binance/Upbit public API 기준으로 표시합니다.',
    tags: ['코인 24h', '거래대금', '공포탐욕'],
    accent: 'green',
    fomoType: 'market_sentiment',
    chartSetupType: '24h 급등 + 거래량 유입',
    chartSetupDescription: '24h 등락률과 거래량이 함께 증가할 때 표시합니다.',
    fomoHeadline: '24h public API 후보',
    fomoSubtext: '거래소 public API 기준 데이터입니다.',
    fomoMetric: '24h',
    fomoCta: '차트 보기',
    sourceLabel: 'Binance/Upbit public API',
    fomoSignals: [
      { label: '가격', value: 'Binance 24h ticker 또는 Upbit ticker 기준입니다.' },
      { label: '캔들', value: 'Binance/Upbit candle API 기준입니다.' },
      { label: '심리', value: 'Alternative Fear & Greed API 기준입니다.' },
    ],
    savedListCopy: '24h 가격과 거래량을 다시 확인',
    diagnosis: {
      score: 68,
      monthChange: '24h 기준',
      leader: '거래소 public API',
      supplyStars: 3,
      finance: '해당 없음',
      valuation: '자료 준비중',
      sectorMomentum: '대형코인',
      atr: '캔들 기준 산출 가능',
      volume: '24h 거래량',
      shortSelling: '해당 없음',
    },
    formula: commonFormula,
  },
];

export const getStockCard = (id: string) => stockCards.find((card) => card.id === id) ?? stockCards[0];
