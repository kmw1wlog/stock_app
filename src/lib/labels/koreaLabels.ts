import type { AssetLabelView, LabelInput } from './labelEngine';
import { buildCommonLabels } from './labelEngine';

export function buildKoreaLabels(input: LabelInput): AssetLabelView[] {
  return [
    ...buildCommonLabels(input),
    { labelType: 'flow', labelKey: 'foreign_flow', displayText: '외국인 수급 보통', grade: '보통', basis: '공공/수급 provider fallback' },
    { labelType: 'flow', labelKey: 'institution_flow', displayText: '기관 수급 강함', grade: '강함', basis: '공공/수급 provider fallback' },
    { labelType: 'short', labelKey: 'short_selling', displayText: '공매도 유의', grade: '유의', basis: '공매도 provider fallback' },
    { labelType: 'finance', labelKey: 'stability', displayText: '재무 안정성 보통', grade: '보통', basis: 'DART fallback' },
    { labelType: 'disclosure', labelKey: 'dart_event', displayText: '공시 이벤트 없음', grade: '없음', basis: 'OpenDART 최근 공시 기준' },
  ];
}
