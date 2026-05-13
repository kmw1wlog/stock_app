import type { AssetLabelView } from '@/lib/labels/labelEngine';

export function generateReactionZone(labels: AssetLabelView[]) {
  const hasVolume = labels.some((label) => label.labelKey === 'volume_attention' && label.grade === '증가');
  const hasMomentum = labels.some((label) => label.labelKey === 'upward_pressure' && label.grade === '강함');

  if (hasVolume && hasMomentum) {
    return {
      title: '거래량 유입 + 단기 상승압력 반응 구간',
      description: '이 반응 구간에서 포착된 종목이 다시 관심 후보에 들어왔습니다.',
    };
  }

  return {
    title: '반응 구간 관찰 후보',
    description: '비슷한 반응 구간의 카드가 다시 확인되고 있습니다.',
  };
}
