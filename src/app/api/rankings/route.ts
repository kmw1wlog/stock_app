import { NextResponse } from 'next/server';
import { envelope, getDisplayCards, sortCards } from '@/lib/marketData';

export async function GET() {
  const cards = await getDisplayCards(160);
  const categories = [
    { key: 'kr-gainers', title: '국장 상승률 TOP', basis: '전일 기준 · 공공데이터', items: sortCards(cards.filter((card) => card.market === 'KR' && (card.changePct ?? 0) > 0), 'gainer').slice(0, 20) },
    { key: 'kr-losers', title: '국장 하락률 TOP', basis: '전일 기준 · 공공데이터', items: sortCards(cards.filter((card) => card.market === 'KR' && (card.changePct ?? 0) < 0), 'loser').slice(0, 20) },
    { key: 'kr-volume', title: '국장 거래대금 TOP', basis: '전일 기준 · 공공데이터', items: sortCards(cards.filter((card) => card.market === 'KR'), 'amount').slice(0, 20) },
    { key: 'news-disclosure', title: '뉴스/공시 발생 종목', basis: 'Naver 뉴스/OpenDART/SEC EDGAR 기준', items: cards.filter((card) => card.source.includes('naver') || card.source.includes('sec') || card.source.includes('dart') || card.labels.some((label) => label.includes('뉴스') || label.includes('공시'))).slice(0, 20) },
    { key: 'chart-setup', title: '차트자리 후보', basis: '저장된 가격 라벨 기준', items: cards.filter((card) => card.chartSetupType || card.labels.some((label) => label.includes('차트자리'))).slice(0, 20) },
    { key: 'us-sec', title: '미장 SEC 이벤트', basis: 'SEC EDGAR 기준 · 가격은 TradingView 위젯', items: cards.filter((card) => card.market === 'US').slice(0, 20) },
    { key: 'crypto-gainers', title: '코인 24h 상승률 TOP', basis: '24h 기준 · Binance/Upbit public API', items: sortCards(cards.filter((card) => card.market === 'CRYPTO' && (card.changePct ?? 0) > 0), 'gainer').slice(0, 20) },
    { key: 'crypto-volume', title: '코인 거래대금 TOP', basis: '24h 기준 · Binance/Upbit public API', items: sortCards(cards.filter((card) => card.market === 'CRYPTO'), 'amount').slice(0, 20) },
  ];
  const payload = envelope(categories, 'db/provider', '공식 데이터 기준 랭킹', { message: cards.length ? undefined : '데이터 준비중' });
  return NextResponse.json({ ...payload, categories });
}
