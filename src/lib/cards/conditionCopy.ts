import { buildAlertConditionSummary } from '@/lib/cards/cardUiCopy';
import type { FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';

export type ConditionCopyViewModel = {
  conditionName: string;
  kiwoomTemplate: string;
  tradingViewTemplate: string;
  explanation: string;
};

export function buildConditionCopyViewModel(card: DisplayCard, formula: FormulaDefinition): ConditionCopyViewModel {
  const conditionName = buildAlertConditionSummary(card, formula);
  const name = card.name;
  const symbol = card.symbol;

  return {
    conditionName,
    explanation: '복사용 템플릿입니다. 실제 HTS/TradingView 조건 문법은 사용 환경에 맞게 조정해야 합니다.',
    kiwoomTemplate: [
      `[${name} ${conditionName}]`,
      `종목코드: ${symbol}`,
      '조건: 신고가 재시도 구간 + 거래대금 증가 + 시장대비 강세',
      '알림: 조건 충족 시 관심 알림',
    ].join('\n'),
    tradingViewTemplate: [
      `// ${name} ${conditionName}`,
      'newHighAttempt = close >= ta.highest(high, 20) * 0.98',
      'volumeSignal = volume > ta.sma(volume, 20) * 1.5',
      'relativeStrength = close / close[1] > 1.01',
      'alertcondition(newHighAttempt and volumeSignal and relativeStrength, "Stock App alert", "condition matched")',
    ].join('\n'),
  };
}
