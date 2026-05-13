import type { DisplayPolicy, MarketType } from '@/lib/display/displayPolicy';

type FomoInput = {
  market: MarketType;
  cardType: string;
  returnToHighPct?: number;
  displayPolicy: DisplayPolicy;
  basis: string;
};

export function generateFomoText(input: FomoInput) {
  if (input.returnToHighPct !== undefined && input.displayPolicy.canComputeFomoReturn) {
    const basis = input.market === 'KR' ? '전일/EOD 기준' : input.market === 'CRYPTO' ? '24h/분봉 기준' : input.basis;
    return `이 카드는 피드에 뜬 뒤 고가 기준 +${input.returnToHighPct.toFixed(1)}%까지 반응했습니다. ${basis}`;
  }

  if (input.market === 'US') {
    return '위젯 기준으로 다시 확인된 카드입니다. SEC 이벤트와 시장 관심 라벨을 함께 확인하세요.';
  }

  if (input.cardType === 'copy_popular_formula') {
    return '조건식 확인 요청이 최근 7일 빠르게 늘었습니다.';
  }

  return '저장하지 않고 넘긴 카드가 다시 조건을 충족했습니다.';
}
