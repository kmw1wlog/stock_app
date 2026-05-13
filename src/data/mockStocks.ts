import type { MarketType } from '@/lib/display/displayPolicy';

export type FomoType =
  | 'missed_profit'
  | 'save_spike'
  | 'formula_copy'
  | 'chart_seat'
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
  style: '단기형' | '스윙형' | '장기형';
  titleReason: string;
  subReason: string;
  priceChangeRate: number;
  volumeAmountText: string;
  saveTrend: '급상승' | '상승' | '보통';
  riskLevel: '낮음' | '중간' | '높음';
  socialProof: string;
  tags: string[];
  accent: 'blue' | 'green' | 'orange' | 'violet';
  fomoType: FomoType;
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
    dataBasisLabel: '전일 기준 · 공공데이터',
    coreLabels: ['상승압력 강함', '거래량 관심 증가', '기관 수급 강함'],
    name: '레인보우로보틱스',
    theme: '로봇 테마',
    market: '국장',
    style: '단기형',
    titleReason: '거래대금 급증 + 20일선 돌파',
    subReason: '뉴스 모멘텀과 함께 다시 강해지는 흐름',
    priceChangeRate: 12.4,
    volumeAmountText: '1,852억',
    saveTrend: '급상승',
    riskLevel: '중간',
    socialProof: '당신과 비슷한 단기형 사용자는 이 카드 저장 후 모의 기준 수익권을 경험했습니다.',
    tags: ['추천', '로봇', 'AI 추천'],
    accent: 'blue',
    fomoType: 'save_spike',
    fomoHeadline: '최근 7일 저장률이 빠르게 오른 카드입니다.',
    fomoSubtext: '로봇 테마를 자주 보는 사용자가 함께 확인했습니다.',
    fomoMetric: '저장률 급상승',
    fomoCta: '비슷한 카드 보기',
    sourceLabel: '앱 내 저장·상세보기 로그 기준',
    fomoSignals: [
      { label: '상세 확인 증가', value: '상세 확인이 빠르게 늘어난 카드입니다.' },
      { label: '저장 증가', value: '최근 7일 저장률이 빠르게 올랐습니다.' },
      { label: '복사 인기', value: '예스트레이더 조건식 보기 클릭이 늘었습니다.' },
    ],
    savedListCopy: '비슷한 사용자 저장률 높음',
    diagnosis: {
      score: 78,
      monthChange: '+32%',
      leader: '기관·외인',
      supplyStars: 4,
      finance: '튼튼',
      valuation: '적정',
      sectorMomentum: '강세',
      atr: '보통',
      volume: '급증',
      shortSelling: '감소',
    },
    formula: {
      yesTrader: ['거래량 > 20일 평균 거래량 × 1.8', '종가 > 20일 이동평균', '종가 > 최근 20일 최고가', '뉴스빈도(3일) >= 1', '거래대금 > 200억', '투자주의 종목 제외'],
      kiwoom: ['거래대금 200억 이상', '20일선 상향 돌파', '최근 20일 신고가 근접', '전일 대비 거래량 180% 이상', '투자경고 제외'],
      tradingView: ['volume > ta.sma(volume, 20) * 1.8', 'close > ta.sma(close, 20)', 'close > ta.highest(close, 20)[1]', 'ta.rsi(close, 14) > 50'],
      indicator: ['MA(종가, 20) 상향 돌파', 'RSI(14) > 50', '거래량 > MA(거래량, 20) × 1.5'],
    },
  },
  {
    id: 'isupetasys',
    marketType: 'KR',
    symbol: '007660',
    tvSymbol: 'KRX:007660',
    dataBasisLabel: '전일 기준 · 공공데이터',
    coreLabels: ['신고가 근접', '기관 수급 강함', '조건식 복사 증가'],
    name: '이수페타시스',
    theme: '반도체 테마',
    market: '국장',
    style: '스윙형',
    titleReason: '기관 순매수 + 신고가 근접',
    subReason: 'AI 반도체 수요 기대와 함께 수급이 붙는 구간',
    priceChangeRate: 8.9,
    volumeAmountText: '942억',
    saveTrend: '급상승',
    riskLevel: '중간',
    socialProof: '예스트레이더 사용자 복사 인기 카드입니다. 최근 7일 조건식 보기 클릭이 늘었습니다.',
    tags: ['복사 인기', '반도체', '기관'],
    accent: 'violet',
    fomoType: 'formula_copy',
    fomoHeadline: '예스트레이더 사용자 복사 인기 카드입니다.',
    fomoSubtext: '최근 7일 조건식 보기 클릭이 빠르게 늘었습니다.',
    fomoMetric: '복사 인기',
    fomoCta: '조건식 보기',
    sourceLabel: '앱 내 조건식 복사 로그 기준',
    fomoSignals: [
      { label: '복사 증가', value: '예스트레이더 탭 클릭이 평균보다 높습니다.' },
      { label: '저장 후 복사', value: '저장 사용자의 조건식 진입률이 올랐습니다.' },
      { label: '수급 관심', value: '기관 순매수 키워드 반응이 강합니다.' },
    ],
    savedListCopy: '예스트레이더 복사 인기',
    diagnosis: {
      score: 82,
      monthChange: '+18%',
      leader: '기관',
      supplyStars: 5,
      finance: '양호',
      valuation: '고평가',
      sectorMomentum: '강세',
      atr: '높음',
      volume: '증가',
      shortSelling: '보통',
    },
    formula: {
      yesTrader: ['기관 순매수 3일 연속', '종가 > 20일 이동평균', '거래대금 > 150억', '최근 60일 고가 95% 이상'],
      kiwoom: ['기관 순매수 상위', '신고가 5% 이내', '거래량 20일 평균 대비 150% 이상'],
      tradingView: ['close > ta.sma(close, 20)', 'close > ta.highest(close, 60) * 0.95', 'volume > ta.sma(volume, 20) * 1.5'],
      indicator: ['기관 순매수 증가', '신고가 근접', '거래량 회복'],
    },
  },
  {
    id: 'alteogen',
    marketType: 'KR',
    symbol: '196170',
    tvSymbol: 'KRX:196170',
    dataBasisLabel: '전일 기준 · 공공데이터',
    coreLabels: ['반응 구간 재등장', '거래대금 회복', '위험도 높음'],
    name: '알테오젠',
    theme: '바이오 테마',
    market: '국장',
    style: '스윙형',
    titleReason: 'RSI 회복 + 거래대금 회복',
    subReason: '눌림목 카드로 많이 저장되는 관찰 후보',
    priceChangeRate: -1.1,
    volumeAmountText: '683억',
    saveTrend: '상승',
    riskLevel: '높음',
    socialProof: '이 테마를 자주 보는 사용자들이 함께 확인한 종목입니다.',
    tags: ['인기 테마', '바이오', '눌림목'],
    accent: 'green',
    fomoType: 'chart_seat',
    fomoHeadline: '이 반응 구간이 다시 나왔습니다.',
    fomoSubtext: '20일선 회복 + 거래대금 회복 자리의 종목입니다.',
    fomoMetric: '자리 재등장',
    fomoCta: '같은 자리 보기',
    sourceLabel: '일봉 차트 패턴 라벨 기준',
    fomoSignals: [
      { label: '반응 구간 반복', value: '비슷한 반응 구간 카드 재확인이 늘었습니다.' },
      { label: '눌림목 관심', value: '바이오 눌림목 키워드 저장이 증가했습니다.' },
      { label: '주의 반응', value: '위험도 높은 카드에서 의견 클릭이 높습니다.' },
    ],
    savedListCopy: '비슷한 반응 구간 보기 가능',
    diagnosis: {
      score: 69,
      monthChange: '+9%',
      leader: '외인·기관',
      supplyStars: 3,
      finance: '보통',
      valuation: '고평가',
      sectorMomentum: '중립',
      atr: '높음',
      volume: '회복',
      shortSelling: '주의',
    },
    formula: {
      yesTrader: ['RSI(14) 45 상향 회복', '거래대금 > 100억', '5일선 > 20일선', '전일 저가 이탈 제외'],
      kiwoom: ['RSI 회복', '외인·기관 동반 매수', '거래량 평균 이상'],
      tradingView: ['ta.rsi(close, 14) > 45', 'volume > ta.sma(volume, 20)', 'ta.sma(close, 5) > ta.sma(close, 20)'],
      indicator: ['RSI(14) 회복', '거래대금 회복', '5일선 회복'],
    },
  },
  {
    id: 'cmes',
    marketType: 'KR',
    symbol: '475400',
    tvSymbol: 'KRX:475400',
    dataBasisLabel: '전일 기준 · 공공데이터',
    coreLabels: ['급등', '커뮤니티 의견 증가', '손절 기준 확인'],
    name: '씨메스',
    theme: '로봇 비전',
    market: '국장',
    style: '단기형',
    titleReason: '급등 후 거래대금 유지',
    subReason: '실시간 급등에서 의견 증가가 붙은 카드',
    priceChangeRate: 18.45,
    volumeAmountText: '318억',
    saveTrend: '급상승',
    riskLevel: '높음',
    socialProof: '최근 급등 카드를 저장한 상위 사용자는 손절 조건을 함께 확인했습니다.',
    tags: ['급등', '로봇', '주의'],
    accent: 'orange',
    fomoType: 'community_heat',
    fomoHeadline: '종목방 언급량이 빠르게 늘고 있습니다.',
    fomoSubtext: '토스증권·종목방 반응에서 로봇 테마 의견이 증가했습니다.',
    fomoMetric: '의견 증가',
    fomoCta: '의견 보기',
    sourceLabel: '커뮤니티 언급량·앱 의견 클릭 기준',
    fomoSignals: [
      { label: '의견 증가', value: '종목방 반응이 전일 대비 빠르게 늘었습니다.' },
      { label: '상세 확인 증가', value: '급등 카드의 상세 확인이 빠르게 늘었습니다.' },
      { label: '손절 확인', value: '상위 사용자는 손절 기준을 함께 봤습니다.' },
    ],
    savedListCopy: '커뮤니티 의견 증가',
    diagnosis: {
      score: 73,
      monthChange: '+44%',
      leader: '개인·외인',
      supplyStars: 3,
      finance: '보통',
      valuation: '과열',
      sectorMomentum: '강세',
      atr: '높음',
      volume: '폭증',
      shortSelling: '자료 부족',
    },
    formula: {
      yesTrader: ['등락률 > 10%', '거래대금 > 100억', '윗꼬리 비율 < 35%', '투자경고 제외'],
      kiwoom: ['실시간 급등', '거래대금 상위', '상한가 근접 제외'],
      tradingView: ['close / close[1] > 1.1', 'volume > ta.sma(volume, 20) * 2', '(high - close) / (high - low) < 0.35'],
      indicator: ['등락률 급등', '거래대금 유지', '윗꼬리 위험 필터'],
    },
  },
  {
    id: 'ecopro',
    marketType: 'KR',
    symbol: '086520',
    tvSymbol: 'KRX:086520',
    dataBasisLabel: '전일 기준 · 공공데이터',
    coreLabels: ['놓친 카드 재등장', '시간외 반응', '외인 수급 회복'],
    name: '에코프로',
    theme: '2차전지',
    market: '국장',
    style: '스윙형',
    titleReason: '하락 후 수급 반전 관찰',
    subReason: '시간외와 섹터맵에서 동시에 관심이 붙는 후보',
    priceChangeRate: 4.3,
    volumeAmountText: '1,104억',
    saveTrend: '보통',
    riskLevel: '중간',
    socialProof: '3일 전 넘긴 카드가 다시 뜨고 있어요. 비슷한 사용자가 다시 저장 중입니다.',
    tags: ['재등장', '2차전지', '수급', '시간외'],
    accent: 'green',
    fomoType: 'missed_profit',
    fomoHeadline: '어제 넘긴 카드가 오늘 다시 떴습니다.',
    fomoSubtext: '장중 최고 +6.8%까지 반응했습니다.',
    fomoMetric: '놓친 기회',
    fomoCta: '놓친 카드 보기',
    sourceLabel: '앱 등장 시점 이후 가격 흐름 기준',
    fomoSignals: [
      { label: '재등장', value: '넘긴 뒤 다시 조건을 충족했습니다.' },
      { label: '시간외 반응', value: '장후 단일가에서 관심이 늘었습니다.' },
      { label: '놓친 카드', value: '놓친 카드 CTA 클릭이 높은 유형입니다.' },
    ],
    savedListCopy: '장후 다시 반응',
    diagnosis: {
      score: 71,
      monthChange: '+7%',
      leader: '외인',
      supplyStars: 4,
      finance: '양호',
      valuation: '고평가',
      sectorMomentum: '회복',
      atr: '보통',
      volume: '증가',
      shortSelling: '감소',
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
    dataBasisLabel: '위젯 제공 · 지연 가능',
    coreLabels: ['실적 이벤트 예정', 'SEC 이벤트 확인', '시장 대비 강세'],
    name: 'Apple',
    theme: 'M7',
    market: '미장',
    style: '스윙형',
    titleReason: '실적 이벤트 + 시장 대비 강세',
    subReason: 'SEC 이벤트와 함께 다시 확인된 카드입니다.',
    priceChangeRate: 2.1,
    volumeAmountText: '위젯',
    saveTrend: '상승',
    riskLevel: '중간',
    socialProof: '미장 카드는 TradingView 위젯 기준으로 다시 확인됩니다.',
    tags: ['실적', 'AI', 'M7', '미장'],
    accent: 'blue',
    fomoType: 'best_reaction',
    fomoHeadline: '위젯 기준으로 다시 확인된 카드입니다.',
    fomoSubtext: 'SEC 이벤트 이후 관심이 증가한 미장 후보입니다.',
    fomoMetric: 'SEC 이벤트',
    fomoCta: '이벤트 보기',
    sourceLabel: 'TradingView 위젯 · SEC 공시 기반 라벨',
    fomoSignals: [
      { label: '상세 확인 증가', value: '실적 이벤트 카드의 상세 확인이 늘었습니다.' },
      { label: 'SEC 이벤트', value: '최근 공시 이벤트와 함께 다시 확인됐습니다.' },
      { label: '위젯 기준', value: '가격/차트는 외부 위젯 제공 기준입니다.' },
    ],
    savedListCopy: 'SEC 이벤트 이후 관심 증가',
    diagnosis: {
      score: 76,
      monthChange: '+6%',
      leader: '기관',
      supplyStars: 4,
      finance: '높음',
      valuation: '적정',
      sectorMomentum: '강세',
      atr: '보통',
      volume: '보통',
      shortSelling: '낮음',
    },
    formula: {
      yesTrader: ['미장 위젯 기준 확인', '실적 이벤트 예정', '시장 대비 강세 라벨', '직접 가격 계산 비활성 시 수익률 문구 제외'],
      kiwoom: ['미장 직접 조건검색 미지원', '관심 후보 라벨로 보관', 'SEC 이벤트 링크 확인'],
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
    dataBasisLabel: '24h 기준 · 공개 API/위젯',
    coreLabels: ['24h 거래량 유입', '레버리지 과열 유의', '공포탐욕 탐욕'],
    name: 'Bitcoin',
    theme: '대형 코인',
    market: '코인',
    style: '단기형',
    titleReason: '24h 급등 + 거래량 유입',
    subReason: '레버리지 과열 유의. 롱 포지션 쏠림이 감지된 카드입니다.',
    priceChangeRate: 4.8,
    volumeAmountText: '24h',
    saveTrend: '급상승',
    riskLevel: '높음',
    socialProof: '코인 카드는 24h 공개 API/위젯 기준으로 라벨을 표시합니다.',
    tags: ['24H 급등', '거래대금', '펀딩비', '선물OI', '공포탐욕', '코인'],
    accent: 'orange',
    fomoType: 'after_hours',
    fomoHeadline: '24h 기준 다시 반응한 코인 카드입니다.',
    fomoSubtext: '거래량 유입과 레버리지 과열 라벨이 동시에 붙었습니다.',
    fomoMetric: '24h 반응',
    fomoCta: '코인 흐름 보기',
    sourceLabel: 'Binance/Upbit public API · CoinGecko 위젯',
    fomoSignals: [
      { label: '상세 확인 증가', value: '24h 급등 카드의 상세 확인이 빠르게 늘었습니다.' },
      { label: '레버리지 유의', value: '롱 포지션 쏠림 가능성을 함께 봅니다.' },
      { label: '공개 API 기준', value: '가격과 라벨은 24h 공개 API 기준입니다.' },
    ],
    savedListCopy: '24h 거래량 유입',
    diagnosis: {
      score: 81,
      monthChange: '+14%',
      leader: '거래량',
      supplyStars: 4,
      finance: '해당 없음',
      valuation: '변동성',
      sectorMomentum: '강세',
      atr: '높음',
      volume: '유입',
      shortSelling: '레버리지 유의',
    },
    formula: {
      yesTrader: ['코인 조건식은 TradingView 기준 사용 권장', '24h 거래대금 증가', 'RSI(14) > 55', '레버리지 과열 라벨 확인'],
      kiwoom: ['코인 미지원', '보관함 라벨로만 저장'],
      tradingView: ['volume > ta.sma(volume, 20) * 1.5', 'ta.rsi(close, 14) > 55', 'close > ta.sma(close, 20)'],
      indicator: ['24h 거래량 유입', 'funding 중립/과열 확인', 'OI 증가'],
    },
  },
];

export const getStockCard = (id: string) => stockCards.find((card) => card.id === id) ?? stockCards[0];
