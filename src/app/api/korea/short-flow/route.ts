import { NextResponse } from 'next/server';
import { fetchKiwoomKrFlow, kiwoomKrFlowMissingEnv } from '@/lib/providers/korea/kiwoomKrData';

export async function GET(request: Request) {
  const symbol = new URL(request.url).searchParams.get('symbol') || '005930';
  const missingEnv = kiwoomKrFlowMissingEnv();
  if (missingEnv.length) {
    return NextResponse.json({
      ok: true,
      mode: 'live',
      source: 'kiwoom-rest',
      basis: '일별 기준 · Kiwoom REST API',
      updatedAt: new Date().toISOString(),
      items: [],
      message: 'Kiwoom REST API 키가 필요합니다.',
      missingEnv,
    });
  }

  try {
    const result = await fetchKiwoomKrFlow(symbol);
    const summary = {
      symbol,
      latestShortSelling: result.data.latestShortSelling,
      latestLending: result.data.latestLending,
      latestInvestor: result.data.latestInvestor,
      refreshCadence: result.data.refreshCadence,
      source: result.source,
      basis: result.basis,
    };
    return NextResponse.json({
      ok: true,
      mode: 'live',
      source: result.source,
      basis: result.basis,
      updatedAt: result.fetchedAt,
      summary,
      items: [result.data],
      refreshCadence: result.data.refreshCadence,
    });
  } catch (error) {
    return NextResponse.json({
      ok: true,
      mode: 'live',
      source: 'kiwoom-rest',
      basis: '일별 기준 · Kiwoom REST API',
      updatedAt: new Date().toISOString(),
      items: [],
      message: error instanceof Error ? error.message : 'Kiwoom REST API 조회 실패',
    });
  }
}
