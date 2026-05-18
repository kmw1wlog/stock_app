import type { FormulaDefinition } from '@/lib/formulas/formulaCatalog';

export type AlertEngineItem = {
  code: string;
  key: string;
  name: string;
  summary: string;
  easyRule: string;
};

export const alertEngineCatalog: AlertEngineItem[] = [
  { code: 'A', key: 'A_volume_spike', name: '거래량 폭발형', summary: '거래량과 거래대금이 평소보다 크게 붙는 흐름입니다.', easyRule: '거래량 2배 이상 + 거래대금 증가' },
  { code: 'B', key: 'B_prev_high_approach', name: '전고점 접근형', summary: '전고점 근처까지 다시 올라오는 흐름을 봅니다.', easyRule: '전고점 3% 이내 + 거래량 증가' },
  { code: 'C', key: 'C_new_high_breakout', name: '신고가 돌파형', summary: '최근 고점을 거래와 함께 넘어서는 흐름입니다.', easyRule: '20일 고점 돌파 + 거래대금 증가' },
  { code: 'D', key: 'D_box_breakout', name: '박스권 상단 돌파형', summary: '박스권 상단을 거래량과 함께 넘는 흐름입니다.', easyRule: '박스 상단 돌파 + 거래량 증가' },
  { code: 'E', key: 'E_pullback_rebreak', name: '눌림목 재돌파형', summary: '눌림 이후 다시 기준선을 회복하는 흐름입니다.', easyRule: '눌림 후 VWAP 위 재진입' },
  { code: 'F', key: 'F_follow_through', name: '장대양봉 후속관찰형', summary: '전일 강한 상승 이후 후속 거래가 붙는지 봅니다.', easyRule: '전일 급등 + 오늘 거래 유지' },
  { code: 'H', key: 'H_risk_watch', name: '위험 감시형', summary: '상승 폭과 변동 폭이 커진 과열 구간을 감시합니다.', easyRule: '급등/변동폭 확대 + 거래량 급증' },
  { code: 'I', key: 'I_opening_gap_hold', name: '시초 갭 유지형', summary: '시초 갭 상승 후 가격을 지키는 흐름입니다.', easyRule: '시초 갭 + VWAP 위 유지' },
  { code: 'J', key: 'J_morning_high_rebreak', name: '오전 고점 재돌파형', summary: '오전에 만든 고점을 다시 넘는 흐름입니다.', easyRule: '오전 고점 재돌파 + 거래량 증가' },
  { code: 'K', key: 'K_vwap_reclaim', name: 'VWAP 재장악형', summary: '장중 기준 가격을 다시 회복하는 흐름입니다.', easyRule: 'VWAP 재장악 + 직전 5봉 대비 거래 증가' },
  { code: 'M', key: 'M_market_relative_strength', name: '시장 역행 강세형', summary: '시장보다 강하게 버티거나 치고 나가는 흐름입니다.', easyRule: '지수대비 강세 + 거래량 증가' },
  { code: 'N', key: 'N_afternoon_reacceleration', name: '오후 재가속형', summary: '오후에 다시 거래와 가격이 붙는 흐름입니다.', easyRule: '오후 재가속 + 거래량 증가' },
  { code: 'O', key: 'O_limit_up_watch', name: '상한가 근접 감시형', summary: '상한가 근처의 과열과 추격 위험을 함께 봅니다.', easyRule: '고가권 근접 + 거래량 증가' },
];

export function pickRecommendedAlertEngine(formulaKey: string) {
  if (/volume|gainer|amount/.test(formulaKey)) return alertEngineCatalog[0];
  if (/news|disclosure/.test(formulaKey)) return alertEngineCatalog.find((item) => item.code === 'M') ?? alertEngineCatalog[0];
  if (/loser|risk/.test(formulaKey)) return alertEngineCatalog.find((item) => item.code === 'H') ?? alertEngineCatalog[0];
  if (/chart|setup/.test(formulaKey)) return alertEngineCatalog.find((item) => item.code === 'C') ?? alertEngineCatalog[0];
  return alertEngineCatalog[0];
}

export function alertEngineToFormula(engine: AlertEngineItem): FormulaDefinition {
  return {
    key: engine.key,
    name: engine.name,
    shortName: engine.name,
    cardLabel: engine.name,
    userIntent: `${engine.name} 알람을 이 종목에 적용합니다.`,
    alertPreviewTemplate: `{name} ${engine.name} 알람 · {reason}`,
    description: engine.summary,
    criteria: [engine.easyRule, '국장 1분봉 런타임 엔진 기준', '조건 충족 시 알림 후보로 표시'],
    excludeRules: ['거래정지 또는 데이터 부족 종목 제외', '알람은 참고 신호이며 매수·매도 추천이 아님'],
    defaultExpiresInDays: engine.code === 'H' || engine.code === 'O' ? 3 : 7,
    riskNote: '단기 신호는 변동성이 크므로 실제 판단은 이용자가 직접 해야 합니다.',
  };
}
