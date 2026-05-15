import { NextResponse } from 'next/server';
import { envelope, getDisplayCards, sortCards } from '@/lib/marketData';

export async function GET() {
  const cards = await getDisplayCards(160);
  const report = {
    summary: {
      title: '오늘 시장 데이터 요약',
      description: cards.length ? '공식 API, DB 저장 데이터, 공식 위젯 기준으로 구성한 요약입니다.' : '아직 표시 가능한 live 데이터가 없습니다.',
      totalCards: cards.length,
      krCount: cards.filter((card) => card.market === 'KR').length,
      usCount: cards.filter((card) => card.market === 'US').length,
      cryptoCount: cards.filter((card) => card.market === 'CRYPTO').length,
    },
    krGainers: sortCards(cards.filter((card) => card.market === 'KR' && (card.changePct ?? 0) > 0), 'gainer').slice(0, 8),
    krLosers: sortCards(cards.filter((card) => card.market === 'KR' && (card.changePct ?? 0) < 0), 'loser').slice(0, 8),
    newsAndFilings: cards.filter((card) => card.source.includes('naver') || card.source.includes('sec') || card.source.includes('dart') || card.labels.some((label) => label.includes('뉴스') || label.includes('공시'))).slice(0, 8),
    themes: Object.entries(cards.reduce<Record<string, number>>((acc, card) => {
      if (card.theme) acc[card.theme] = (acc[card.theme] ?? 0) + 1;
      return acc;
    }, {})).map(([theme, count]) => ({ theme, count })),
    usEvents: cards.filter((card) => card.market === 'US').slice(0, 8),
    crypto: sortCards(cards.filter((card) => card.market === 'CRYPTO'), 'gainer').slice(0, 8),
  };
  const payload = envelope([report], 'db/provider', '공식 데이터 기준 시장 리포트', { message: cards.length ? undefined : '데이터 준비중' });
  return NextResponse.json({ ...payload, report });
}
