export const opportunityReport = {
  title: '어제 넘긴 카드 2개가 오늘 다시 급등 후보에 들어왔어요.',
  subtitle: '가장 먼저 반응한 카드는 장중 최고 +6.8%까지 움직였습니다.',
  bullets: [
    '최근 7일 저장률 급상승 카드를 3개 놓쳤습니다.',
    '예스트레이더 복사 인기 카드 중 1개를 넘겼습니다.',
    '장후 시간외에서 다시 반응한 카드가 있습니다.',
  ],
  metrics: [
    { label: '놓친 상승 카드', value: '6개', sub: '이번 주 기준' },
    { label: '저장 후 수익권', value: '3개', sub: '가상추적 기준' },
    { label: '복사 인기 놓침', value: '2개', sub: '예스트레이더 기준' },
  ],
  actions: [
    {
      title: '놓친 카드 다시 보기',
      description: '어제 넘긴 카드 중 2개가 다시 조건을 충족했습니다.',
      cta: '다시 보기',
      eventName: 'missed_card_click',
    },
    {
      title: '비슷한 반응 구간 보기',
      description: '20일선 회복 + 거래대금 급증 반응 구간의 종목을 모았습니다.',
      cta: '구간 보기',
      eventName: 'reaction_zone_click',
    },
    {
      title: '복사 인기 조건식 보기',
      description: '예스트레이더 사용자가 많이 가져간 조건식입니다.',
      cta: '조건식 보기',
      eventName: 'formula_view',
    },
  ],
  bestStimulus: {
    title: '이번 주 클릭이 가장 많았던 문구: 놓친 카드 다시 보기',
    subtitle: '사용자들은 수익보다 놓친 기회에 더 오래 머물렀습니다.',
  },
};
