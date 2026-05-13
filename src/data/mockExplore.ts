import { stockCards } from './mockStocks';

export const marketMovers = [
  { label: '급등', name: '씨메스', rate: 18.45, cardId: 'cmes', hint: '오늘 저장률이 빠르게 오른 종목' },
  { label: '상승예상', name: '에코프로', rate: 11.32, cardId: 'ecopro', hint: '장후 다시 반응한 후보' },
  { label: '상한가', name: '동양철관', rate: 29.98, cardId: 'rainbow-robotics', hint: '놓치면 내일 다시 확인할 카드' },
];

export const losers = [
  { label: '하락', value: '-4.21%', hint: '반등 후보로 저장 증가' },
  { label: '급락', value: '-6.17%', hint: '위험도 확인 클릭 증가' },
  { label: '눌림목 후보', value: '관심 283', hint: '같은 차트자리 관심 증가' },
];

export const afterHours = [
  { name: '현대공업', rate: '+2.81%', time: '20:00' },
  { name: '에스앤에스텍', rate: '-1.23%', time: '20:00' },
  { name: '파두', rate: '+0.76%', time: '20:00' },
];

export const themes = ['반도체', '로봇', '바이오', '전력', 'AI', '2차전지'];

export const news = [
  '[속보] 반도체 수출 호조, 관련주 강세',
  '로봇 시장 2025년 성장 전망',
  'AI 반도체 수요 증가 기대감 확산',
];

export const accumulation = [
  { label: '기관 순매수 TOP', hint: '기관·외인이 동시에 본 종목', card: stockCards[1] },
  { label: '외인 순매수 TOP', hint: '놓치면 내일 다시 확인할 카드', card: stockCards[4] },
  { label: '기관·외인 동시 매수', hint: '조건식 복사 전환율 높음', card: stockCards[2] },
];
