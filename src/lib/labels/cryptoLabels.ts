import type { AssetLabelView, LabelInput } from './labelEngine';
import { buildCommonLabels } from './labelEngine';

export function buildCryptoLabels(input: LabelInput): AssetLabelView[] {
  return [
    ...buildCommonLabels(input),
    { labelType: 'volume_24h', labelKey: 'volume_inflow', displayText: '24h 거래량 데이터 확인', grade: 'normal', basis: input.quote?.basis ?? '24h 기준 · public API' },
    { labelType: 'sentiment', labelKey: 'fear_greed_pending', displayText: '공포탐욕 자료 준비중', grade: 'pending', basis: 'Alternative Fear & Greed 공개 API' },
    { labelType: 'chart_setup', labelKey: 'crypto_24h_volume', displayText: '차트자리 자료 준비중', grade: 'pending', basis: input.quote?.basis ?? '24h 기준 · public API' },
  ];
}
