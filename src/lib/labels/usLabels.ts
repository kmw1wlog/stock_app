import type { AssetLabelView, LabelInput } from './labelEngine';
import { buildCommonLabels } from './labelEngine';

export function buildUsLabels(input: LabelInput): AssetLabelView[] {
  return [
    ...buildCommonLabels(input),
    { labelType: 'sec', labelKey: 'sec_event', displayText: 'SEC 공시 확인 대상', grade: 'normal', basis: 'SEC EDGAR metadata' },
    { labelType: 'price', labelKey: 'widget_price', displayText: '가격은 TradingView 위젯 기준', grade: 'normal', basis: 'TradingView 위젯 기준' },
  ];
}
