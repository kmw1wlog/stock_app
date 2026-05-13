import type { AssetLabelView, LabelInput } from './labelEngine';
import { buildCommonLabels } from './labelEngine';

export function buildUsLabels(input: LabelInput): AssetLabelView[] {
  return [
    ...buildCommonLabels(input),
    { labelType: 'earnings', labelKey: 'earnings_event', displayText: '실적 이벤트 예정', grade: '유의', basis: 'SEC/캘린더 fallback' },
    { labelType: 'sec', labelKey: 'sec_event', displayText: 'SEC 이벤트 10-Q', grade: '유의', basis: 'SEC EDGAR metadata' },
    { labelType: 'institution', labelKey: 'institution_attention', displayText: '기관 관심 보통', grade: '보통', basis: '13F/시장 데이터 fallback' },
    { labelType: 'short', labelKey: 'short_pressure', displayText: '숏 압력 보통', grade: '보통', basis: 'FINRA fallback' },
    { labelType: 'ftd', labelKey: 'ftd_attention', displayText: 'FTD 유의 없음', grade: '없음', basis: 'FINRA/SEC fallback' },
  ];
}
