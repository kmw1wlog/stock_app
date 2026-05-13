export const opportunityReport = {
  title: '넘긴 카드 2개가 오늘 다시 조건을 충족했습니다.',
  subtitle: '저장하지 않고 넘긴 카드가 기준 시점 이후 다시 관심 후보에 들어왔습니다.',
  bullets: [
    '최근 7일 저장 급증 카드 3개를 넘겼습니다.',
    '조건식 인기 카드 중 1개가 다시 확인됐습니다.',
    '시간외 후보에서 다시 관심이 붙은 카드가 있습니다.',
  ],
  metrics: [
    { label: '놓친 카드', value: '6개', sub: '이번 주 기준' },
    { label: '결과 추적', value: '3개', sub: '가상추적 기준' },
    { label: '조건식 확인', value: '2개', sub: '복사 전용 기준' },
  ],
  actions: [
    {
      title: '놓친 카드 다시 보기',
      description: '저장하지 않고 넘긴 카드가 다시 조건을 충족했습니다.',
      cta: '다시 보기',
      eventName: 'missed_card_click',
    },
    {
      title: '같은 차트자리 종목 보기',
      description: '20일선 회복 + 거래대금 유입 차트자리 종목을 모았습니다.',
      cta: '차트자리',
      eventName: 'chart_seat_click',
    },
    {
      title: '조건식 인기 카드 보기',
      description: '조건식까지 확인한 사용자가 많이 본 복사용 조건식입니다.',
      cta: '조건식',
      eventName: 'formula_view',
    },
  ],
  bestStimulus: {
    title: '이번 주 가장 많이 확인된 문구: 놓친 카드 다시 보기',
    subtitle: '사용자는 수익 보장 문구보다 넘긴 카드의 재확인 신호에 더 빠르게 반응했습니다.',
  },
};
