export const resultByCardId: Record<string, { mine: number; similar: number; status: '추적 중' | '수익권' | '주의' | '놓친 카드'; note: string; missed?: boolean }> = {
  'rainbow-robotics': {
    mine: 1.2,
    similar: 1.6,
    status: '추적 중',
    note: '이 카드를 저장한 사용자 중 조건식까지 확인한 사람들은 손절 기준도 함께 봤습니다.',
  },
  isupetasys: {
    mine: 4.8,
    similar: 3.9,
    status: '수익권',
    note: '수익권에 진입한 카드입니다. 일부 차익 실현을 고민해보세요.',
  },
  alteogen: {
    mine: -1.1,
    similar: -0.4,
    status: '주의',
    note: '유사 사용자 대비 성과 차이가 커서 원인 확인이 필요합니다.',
  },
  cmes: {
    mine: 6.21,
    similar: 4.7,
    status: '놓친 카드',
    note: '이 카드는 앱에 뜬 뒤 다음 거래일 고점 기준 크게 반응했습니다.',
    missed: true,
  },
  ecopro: {
    mine: 2.3,
    similar: 1.8,
    status: '놓친 카드',
    note: '어제 넘긴 뒤 장후 시간외에서 다시 반응한 카드입니다.',
    missed: true,
  },
};

export const bestResults = [
  { name: '에이아이코어', rate: 8.73 },
  { name: '씨메스', rate: 6.21 },
  { name: '피앤씨솔루션', rate: 5.12 },
];
