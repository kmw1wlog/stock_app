import type { AssetLabelView, LabelInput } from './labelEngine';
import { buildCommonLabels } from './labelEngine';

export function buildCryptoLabels(input: LabelInput): AssetLabelView[] {
  return [
    ...buildCommonLabels(input),
    { labelType: 'volume_24h', labelKey: 'volume_inflow', displayText: '24h 거래량 유입', grade: '증가', basis: 'Binance/Upbit public API' },
    { labelType: 'leverage', labelKey: 'leverage_heat', displayText: '레버리지 과열 유의', grade: '주의', basis: 'Binance/Coinalyze fallback' },
    { labelType: 'funding', labelKey: 'funding', displayText: 'funding 중립', grade: '보통', basis: 'funding fallback' },
    { labelType: 'oi', labelKey: 'open_interest', displayText: 'OI 증가', grade: '증가', basis: 'open interest fallback' },
    { labelType: 'fear_greed', labelKey: 'fear_greed', displayText: '공포탐욕 탐욕', grade: '주의', basis: 'Alternative Fear & Greed' },
    { labelType: 'ecosystem', labelKey: 'tvl_fees', displayText: 'TVL/fees/revenue 보통', grade: '보통', basis: 'DefiLlama fallback' },
    { labelType: 'chart_setup', labelKey: 'crypto_24h_volume', displayText: '차트자리: 코인 24H 급등 + 거래량 유입', grade: '증가', basis: '24h 기준 · public API fallback' },
  ];
}
