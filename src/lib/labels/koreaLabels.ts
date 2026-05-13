import type { AssetLabelView, LabelInput } from './labelEngine';
import { buildCommonLabels } from './labelEngine';

export function buildKoreaLabels(input: LabelInput): AssetLabelView[] {
  return [
    ...buildCommonLabels(input),
    { labelType: 'flow', labelKey: 'foreign_flow', displayText: '외국인 수급 보통', grade: '보통', basis: 'KRX/KIS provider fallback' },
    { labelType: 'flow', labelKey: 'institution_flow', displayText: '기관 수급 강함', grade: '강함', basis: 'KRX/KIS provider fallback' },
    { labelType: 'short', labelKey: 'short_selling', displayText: '공매도 자료 준비중', grade: '주의', basis: 'KRX 조회 불가 · 라벨 비활성 fallback' },
    { labelType: 'finance', labelKey: 'stability', displayText: '재무 안정성 보통', grade: '보통', basis: 'OpenDART fallback' },
    { labelType: 'disclosure', labelKey: 'dart_event', displayText: '공시 이벤트 없음', grade: '없음', basis: 'OpenDART 최근 공시 기준' },
    { labelType: 'chart_setup', labelKey: 'ma20_volume', displayText: '차트자리: 20일선 회복 + 거래대금 유입', grade: '증가', basis: input.quote?.basis ?? '전일 기준 · 공공데이터 fallback' },
  ];
}
