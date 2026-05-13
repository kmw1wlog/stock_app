import type { MarketType } from '@/lib/display/displayPolicy';

export type FomoType =
  | 'missed_profit'
  | 'save_spike'
  | 'formula_copy'
  | 'chart_setup'
  | 'community_heat'
  | 'after_hours'
  | 'best_reaction';

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
  style: '관심' | '공격' | '보수';
  titleReason: string;
  subReason: string;
  priceChangeRate: number;
  volumeAmountText: string;
  saveTrend: '급증' | '상승' | '보통';
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

export const stockCards: StockCard[] = [
  {
    id: 'rainbow-robotics',
    marketType: 'KR',
    symbol: '277810',
    tvSymbol: 'KRX:277810',
    dataBasisLabel: '전일 기준 · 공공데이터 fallback',
    coreLabels: ['상승압력 강함', '거래량 관심 증가', '기관 수급 강함'],
    name: '레인보우로보틱스',
    theme: '로봇',
    market: '국장',
    style: '관심',
    titleReason: '거래대금 급증 + 20일선 회복',
    subReason: '로봇 테마 안에서 수급과 저장 증가가 같이 붙은 카드입니다.',
    priceChangeRate: 12.4,
    volumeAmountText: '1,852억',
    saveTrend: '급증',
    riskLevel: '중간',
    socialProof: '이 카드를 저장한 사용자 중 조건식까지 확인한 사람들이 손절 기준도 함께 봤습니다.',
    tags: ['오늘 급등', '로봇', '차트자리', '기관외인'],
    accent: 'blue',
    fomoType: 'save_spike',
    chartSetupType: '20일선 회복 + 거래대금 유입',
    chartSetupDescription: '20일선 회복 이후 거래대금이 함께 늘어난 차트자리입니다.',
    fomoHeadline: '저장 후 다시 확인한 사용자가 늘어난 카드입니다.',
    fomoSubtext: '같은 로봇 테마를 본 사용자들이 조건식과 결과 추적을 함께 확인했습니다.',
    fomoMetric: '저장 급증',
    fomoCta: '차트자리 보기',
    sourceLabel: '앱 내 저장/복사 이벤트 기준',
    fomoSignals: [
      { label: '저장 증가', value: '최근 저장 액션이 평균보다 빠르게 늘었습니다.' },
      { label: '조건식 확인 증가', value: '조건식까지 확인한 사용자가 함께 늘었습니다.' },
      { label: '결과 추적 추가', value: '저장 뒤 결과 추적에 담은 사용자가 확인됩니다.' },
    ],
    savedListCopy: '저장 후 결과까지 본 사용자 관심',
    diagnosis: {
      score: 78,
      monthChange: '+32%',
      leader: '기관·외인',
      supplyStars: 4,
      finance: '양호',
      valuation: '중립',
      sectorMomentum: '강세',
      atr: '보통',
      volume: '급증',
      shortSelling: '자료 준비중',
    },
    formula: {
      yesTrader: ['거래대금 > 200억', '종가 > 20일 이동평균', '거래량 > 20일 평균 * 1.8', 'RSI(14) > 50', '투자경고 제외'],
      kiwoom: ['거래대금 200억 이상', '20일선 상향 회복', '전일 대비 거래량 180% 이상', '투자주의 종목 제외'],
      tradingView: ['volume > ta.sma(volume, 20) * 1.8', 'close > ta.sma(close, 20)', 'ta.rsi(close, 14) > 50'],
      indicator: ['MA(종가, 20) 회복', 'RSI(14) > 50', '거래량 > MA(거래량, 20) * 1.5'],
    },
  },
  {
    id: 'isupetasys',
    marketType: 'KR',
    symbol: '007660',
    tvSymbol: 'KRX:007660',
    dataBasisLabel: '전일 기준 · 공공데이터 fallback',
    coreLabels: ['신고가 근접', '기관 수급 강함', '조건식 확인 증가'],
    name: '이수페타시스',
    theme: '반도체',
    market: '국장',
    style: '공격',
    titleReason: '신고가 근접 + 거래량 증가',
    subReason: 'AI 반도체 수요 기대와 거래량 회복이 같이 잡힌 카드입니다.',
    priceChangeRate: 8.9,
    volumeAmountText: '942억',
    saveTrend: '급증',
    riskLevel: '중간',
    socialProof: '조건식까지 확인한 사용자들은 거래대금 라벨을 먼저 확인했습니다.',
    tags: ['조건식 인기', '반도체', '기관외인', '차트자리'],
    accent: 'violet',
    fomoType: 'formula_copy',
    chartSetupType: '신고가 근접 + 거래량 증가',
    chartSetupDescription: '고점 부근에서 거래량이 다시 붙는 차트자리입니다.',
    fomoHeadline: '조건식 확인이 빠르게 늘어난 카드입니다.',
    fomoSubtext: '복사용 조건식을 열어 본 사용자가 최근 7일 평균보다 많습니다.',
    fomoMetric: '조건식 인기',
    fomoCta: '조건식 보기',
    sourceLabel: '조건식 보기/복사 로그 기준',
    fomoSignals: [
      { label: '복사 관심', value: '조건식 복사 클릭이 평균보다 높습니다.' },
      { label: '수급 확인', value: '기관 수급 라벨과 함께 확인된 카드입니다.' },
      { label: '고점 근접', value: '신고가 근접 구간이라 위험 라벨도 함께 표시됩니다.' },
    ],
    savedListCopy: '조건식까지 확인한 사용자 관심',
    diagnosis: {
      score: 82,
      monthChange: '+18%',
      leader: '기관',
      supplyStars: 5,
      finance: '양호',
      valuation: '고평가 유의',
      sectorMomentum: '강세',
      atr: '높음',
      volume: '증가',
      shortSelling: '자료 준비중',
    },
    formula: {
      yesTrader: ['종가 > 20일 이동평균', '거래대금 > 150억', '최근 60일 고가의 95% 이상', '거래량 > 20일 평균 * 1.5'],
      kiwoom: ['신고가 5% 이내', '거래대금 상위', '거래량 20일 평균 대비 150% 이상'],
      tradingView: ['close > ta.sma(close, 20)', 'close > ta.highest(close, 60) * 0.95', 'volume > ta.sma(volume, 20) * 1.5'],
      indicator: ['신고가 근접', '거래량 회복', '기관 매수 우위'],
    },
  },
  {
    id: 'alteogen',
    marketType: 'KR',
    symbol: '196170',
    tvSymbol: 'KRX:196170',
    dataBasisLabel: '전일 기준 · 공공데이터 fallback',
    coreLabels: ['RSI 회복', '거래대금 회복', '위험도 높음'],
    name: '알테오젠',
    theme: '바이오',
    market: '국장',
    style: '공격',
    titleReason: 'RSI 회복 + 거래대금 회복',
    subReason: '눌림목 이후 다시 관심 후보에 들어온 카드입니다.',
    priceChangeRate: -1.1,
    volumeAmountText: '683억',
    saveTrend: '상승',
    riskLevel: '높음',
    socialProof: '저장 후 다시 확인한 사용자가 늘어난 바이오 카드입니다.',
    tags: ['놓친 카드', '바이오', '차트자리', '눌림목'],
    accent: 'green',
    fomoType: 'chart_setup',
    chartSetupType: 'RSI 회복 + 거래대금 회복',
    chartSetupDescription: '과열 이후 눌림 구간에서 RSI와 거래대금이 같이 회복되는 자리입니다.',
    fomoHeadline: '같은 차트자리에서 반응했던 종목으로 다시 잡혔습니다.',
    fomoSubtext: '비슷한 차트자리 카드가 재확인되며 결과 탭 후보로 들어왔습니다.',
    fomoMetric: '차트자리',
    fomoCta: '같은 차트자리 보기',
    sourceLabel: '가격/거래량 라벨 기준',
    fomoSignals: [
      { label: '차트자리 재확인', value: '동일 차트자리 유형의 카드가 다시 조건을 충족했습니다.' },
      { label: '눌림목 관심', value: '바이오 눌림목 키워드와 함께 확인된 카드입니다.' },
      { label: '위험도 높음', value: '변동성이 커서 위험도 라벨을 함께 봐야 합니다.' },
    ],
    savedListCopy: '같은 차트자리에서 반응했던 카드',
    diagnosis: {
      score: 69,
      monthChange: '+9%',
      leader: '외인·기관',
      supplyStars: 3,
      finance: '보통',
      valuation: '고평가 유의',
      sectorMomentum: '중립',
      atr: '높음',
      volume: '회복',
      shortSelling: '자료 준비중',
    },
    formula: {
      yesTrader: ['RSI(14) 45 상향 회복', '거래대금 > 100억', '5일선 > 20일선', '전일 저가 이탈 제외'],
      kiwoom: ['RSI 회복', '거래량 평균 이상', '5일선 20일선 회복'],
      tradingView: ['ta.rsi(close, 14) > 45', 'volume > ta.sma(volume, 20)', 'ta.sma(close, 5) > ta.sma(close, 20)'],
      indicator: ['RSI(14) 회복', '거래대금 회복', '5일선 회복'],
    },
  },
  {
    id: 'cmes',
    marketType: 'KR',
    symbol: '475400',
    tvSymbol: 'KRX:475400',
    dataBasisLabel: '실시간 지연 · fallback',
    coreLabels: ['급등', '의견 확인 증가', '위험도 높음'],
    name: '씨메스',
    theme: '로봇 비전',
    market: '국장',
    style: '공격',
    titleReason: '급등 후 거래대금 유지',
    subReason: '급등 뒤에도 거래대금이 유지되는 위험 강한 카드입니다.',
    priceChangeRate: 18.45,
    volumeAmountText: '318억',
    saveTrend: '급증',
    riskLevel: '높음',
    socialProof: '먼저 확인한 사용자들은 뉴스보다 거래대금 라벨을 먼저 봤습니다.',
    tags: ['오늘 급등', '위험하지만 강함', '로봇', '뉴스'],
    accent: 'orange',
    fomoType: 'community_heat',
    chartSetupType: '상한가 근접 후 거래대금 유지',
    chartSetupDescription: '급등 이후 거래대금이 줄지 않는 고위험 차트자리입니다.',
    fomoHeadline: '의견 확인과 상세 확인이 함께 늘어난 카드입니다.',
    fomoSubtext: '급등주 카드에서 커뮤니티 키워드와 위험 라벨이 같이 확인됩니다.',
    fomoMetric: '의견 확인 증가',
    fomoCta: '반응 보기',
    sourceLabel: '뉴스 제목/키워드 및 앱 이벤트 기준',
    fomoSignals: [
      { label: '의견 확인 증가', value: '의견 확인 클릭이 전일 대비 늘었습니다.' },
      { label: '상세 확인 증가', value: '급등 카드 상세 확인이 빠르게 증가했습니다.' },
      { label: '위험 라벨 확인', value: '위험도 높음 라벨과 함께 확인된 카드입니다.' },
    ],
    savedListCopy: '의견 확인 증가 카드',
    diagnosis: {
      score: 73,
      monthChange: '+44%',
      leader: '개인·외인',
      supplyStars: 3,
      finance: '보통',
      valuation: '과열',
      sectorMomentum: '강세',
      atr: '높음',
      volume: '급증',
      shortSelling: '자료 준비중',
    },
    formula: {
      yesTrader: ['등락률 > 10%', '거래대금 > 100억', '윗꼬리 비율 < 35%', '투자경고 제외'],
      kiwoom: ['실시간 급등', '거래대금 상위', '상한가 근접 후 이탈 제외'],
      tradingView: ['close / close[1] > 1.1', 'volume > ta.sma(volume, 20) * 2', '(high - close) / (high - low) < 0.35'],
      indicator: ['등락률 급등', '거래대금 유지', '윗꼬리 위험 필터'],
    },
  },
  {
    id: 'ecopro',
    marketType: 'KR',
    symbol: '086520',
    tvSymbol: 'KRX:086520',
    dataBasisLabel: '전일 기준 · 공공데이터 fallback',
    coreLabels: ['놓친 카드 재확인', '시간외 반응', '외인 수급 회복'],
    name: '에코프로',
    theme: '2차전지',
    market: '국장',
    style: '보수',
    titleReason: '하락 후 수급 반전 관찰',
    subReason: '저장하지 않고 넘긴 카드가 다시 조건을 충족했습니다.',
    priceChangeRate: 4.3,
    volumeAmountText: '1,104억',
    saveTrend: '보통',
    riskLevel: '중간',
    socialProof: '넘긴 뒤 다시 확인된 카드로 결과 탭에서 재확인 요청이 늘었습니다.',
    tags: ['놓친 카드', '시간외', '2차전지', '수급'],
    accent: 'green',
    fomoType: 'missed_profit',
    chartSetupType: '급등 후 눌림목',
    chartSetupDescription: '급락 이후 수급과 거래대금이 다시 회복되는 눌림목 자리입니다.',
    fomoHeadline: '어제 넘긴 뒤 오늘 다시 조건을 충족했습니다.',
    fomoSubtext: '어제 피드 노출 뒤 오늘 고가 기준으로 다시 반응한 카드입니다.',
    fomoMetric: '놓친 카드',
    fomoCta: '놓친 카드 보기',
    sourceLabel: '피드 노출 시점 이후 가격 변화 기준',
    fomoSignals: [
      { label: '다시 조건 충족', value: '저장하지 않고 넘긴 카드가 다시 조건을 충족했습니다.' },
      { label: '시간외 반응', value: '시간외 후보에서 다시 관심이 확인됐습니다.' },
      { label: '결과 재확인', value: '결과 탭에서 다시 확인된 카드입니다.' },
    ],
    savedListCopy: '넘긴 뒤 다시 확인된 카드',
    diagnosis: {
      score: 71,
      monthChange: '+7%',
      leader: '외인',
      supplyStars: 4,
      finance: '양호',
      valuation: '고평가 유의',
      sectorMomentum: '회복',
      atr: '보통',
      volume: '증가',
      shortSelling: '자료 준비중',
    },
    formula: {
      yesTrader: ['외인 순매수 전환', '종가 > 5일 이동평균', '거래대금 > 300억', 'RSI(14) > 45'],
      kiwoom: ['외인 순매수 TOP', '5일선 회복', '거래대금 상위'],
      tradingView: ['close > ta.sma(close, 5)', 'ta.rsi(close, 14) > 45', 'volume > ta.sma(volume, 20) * 1.2'],
      indicator: ['외인 순매수', '5일선 회복', 'RSI 회복'],
    },
  },
  {
    id: 'apple-earnings',
    marketType: 'US',
    symbol: 'AAPL',
    tvSymbol: 'NASDAQ:AAPL',
    dataBasisLabel: '외부 위젯 기준 · SEC metadata fallback',
    coreLabels: ['실적 이벤트', 'SEC 이벤트 확인', '시장 대비 강세'],
    name: 'Apple',
    theme: 'M7',
    market: '미장',
    style: '보수',
    titleReason: '실적 이벤트 + 시장 대비 강세',
    subReason: 'SEC 이벤트 이후 관심이 증가한 미장 후보입니다.',
    priceChangeRate: 2.1,
    volumeAmountText: '위젯',
    saveTrend: '상승',
    riskLevel: '중간',
    socialProof: '결과 추적까지 담은 사용자들은 SEC 이벤트와 거래량 라벨을 함께 확인했습니다.',
    tags: ['프리마켓', '실적 이벤트', 'AI·반도체', '차트자리'],
    accent: 'blue',
    fomoType: 'best_reaction',
    chartSetupType: '미장 실적 이벤트 + 시장 대비 강세',
    chartSetupDescription: '실적 이벤트 전후로 시장 대비 강세가 확인되는 차트자리입니다.',
    fomoHeadline: 'SEC 이벤트 이후 다시 확인된 카드입니다.',
    fomoSubtext: '미장 가격은 외부 위젯 기준으로 표시되며 직접 수익률 문구는 제한합니다.',
    fomoMetric: '실적 이벤트',
    fomoCta: 'SEC 이벤트 보기',
    sourceLabel: 'TradingView 위젯 · SEC EDGAR metadata',
    fomoSignals: [
      { label: '상세 확인 증가', value: '실적 이벤트 카드 상세 확인이 늘었습니다.' },
      { label: 'SEC 이벤트', value: '최근 공시 metadata와 함께 확인된 카드입니다.' },
      { label: '위젯 기준', value: '가격과 차트는 외부 위젯 기준이며 지연될 수 있습니다.' },
    ],
    savedListCopy: 'SEC 이벤트 이후 관심 증가',
    diagnosis: {
      score: 76,
      monthChange: '+6%',
      leader: '기관',
      supplyStars: 4,
      finance: '높음',
      valuation: '중립',
      sectorMomentum: '강세',
      atr: '보통',
      volume: '보통',
      shortSelling: '중간',
    },
    formula: {
      yesTrader: ['미장 직접 조건검색 미지원', '실적 이벤트 예정', '시장 대비 강세 라벨 확인'],
      kiwoom: ['미장 직접 조건검색 미지원', '관심 후보 라벨로 저장'],
      tradingView: ['close > ta.sma(close, 20)', 'volume > ta.sma(volume, 20)', 'earnings event watch'],
      indicator: ['시장 대비 강세', '실적 이벤트', 'SEC 이벤트'],
    },
  },
  {
    id: 'bitcoin-leverage',
    marketType: 'CRYPTO',
    symbol: 'BTC',
    tvSymbol: 'BINANCE:BTCUSDT',
    coingeckoId: 'bitcoin',
    cmcId: '1',
    dataBasisLabel: '24h 기준 · Binance/Upbit public API fallback',
    coreLabels: ['24h 거래량 유입', '레버리지 과열 유의', '공포탐욕 탐욕'],
    name: 'Bitcoin',
    theme: '대형코인',
    market: '코인',
    style: '공격',
    titleReason: '24H 급등 + 거래량 유입',
    subReason: '레버리지 과열 유의 라벨과 함께 잡힌 코인 카드입니다.',
    priceChangeRate: 4.8,
    volumeAmountText: '24h',
    saveTrend: '급증',
    riskLevel: '높음',
    socialProof: '먼저 확인한 사용자들은 펀딩비와 거래대금 라벨을 함께 봤습니다.',
    tags: ['24H 급등', '거래대금', '레버리지', '공포탐욕', '차트자리'],
    accent: 'orange',
    fomoType: 'after_hours',
    chartSetupType: '코인 24H 급등 + 거래량 유입',
    chartSetupDescription: '24시간 상승률과 거래량 유입이 동시에 잡힌 코인 차트자리입니다.',
    fomoHeadline: '24h 기준으로 다시 확인된 코인 카드입니다.',
    fomoSubtext: '거래량 유입과 레버리지 과열 유의 라벨을 함께 확인해야 합니다.',
    fomoMetric: '24H 반응',
    fomoCta: '코인 차트 보기',
    sourceLabel: 'Binance/Upbit public API · CoinGecko 위젯',
    fomoSignals: [
      { label: '거래량 유입', value: '24h 거래량 기준 관심 증가가 확인됩니다.' },
      { label: '레버리지 유의', value: '롱 포지션 과열 가능성을 함께 확인해야 합니다.' },
      { label: '공개 API 기준', value: '가격과 라벨은 공개 API 또는 외부 위젯 기준입니다.' },
    ],
    savedListCopy: '24h 거래량 유입',
    diagnosis: {
      score: 81,
      monthChange: '+14%',
      leader: '거래소',
      supplyStars: 4,
      finance: '해당 없음',
      valuation: '변동성',
      sectorMomentum: '강세',
      atr: '높음',
      volume: '유입',
      shortSelling: '레버리지 유의',
    },
    formula: {
      yesTrader: ['코인은 TradingView 조건식 사용 권장', '24h 거래대금 증가', 'RSI(14) > 55', '레버리지 과열 라벨 확인'],
      kiwoom: ['코인 미지원', '보관함 라벨로만 저장'],
      tradingView: ['volume > ta.sma(volume, 20) * 1.5', 'ta.rsi(close, 14) > 55', 'close > ta.sma(close, 20)'],
      indicator: ['24h 거래량 유입', 'funding 중립/과열 확인', 'OI 증가 확인'],
    },
  },
];

export const getStockCard = (id: string) => stockCards.find((card) => card.id === id) ?? stockCards[0];
