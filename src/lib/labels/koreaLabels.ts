import type { AssetLabelView, LabelInput } from './labelEngine';
import { buildCommonLabels } from './labelEngine';

export function buildKoreaLabels(input: LabelInput): AssetLabelView[] {
  return [
    ...buildCommonLabels(input),
    { labelType: 'short', labelKey: 'short_selling_pending', displayText: '공매도 자료 준비중', grade: 'pending', basis: 'KRX 조회 불가 · 라벨 비활성' },
    { labelType: 'flow', labelKey: 'investor_flow_pending', displayText: '수급 자료 준비중', grade: 'pending', basis: 'KRX/KIS provider 필요' },
    { labelType: 'chart_setup', labelKey: 'price_volume_candidate', displayText: '차트자리 자료 준비중', grade: 'pending', basis: input.quote?.basis ?? '전일 기준 · 공공데이터' },
  ];
}
