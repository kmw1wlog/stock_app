import { NextRequest, NextResponse } from 'next/server';
import { buildCardDetailData } from '@/lib/cards/buildCardDetailData';
import type { DisplayCard } from '@/lib/marketDataTypes';
import { formulaCatalog } from '@/lib/formulas/formulaCatalog';

export const dynamic = 'force-dynamic';

function numberFrom(value: string | null) {
  if (!value) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const symbol = searchParams.get('symbol') ?? '';
  const name = searchParams.get('name') ?? symbol;
  const market = (searchParams.get('market') ?? 'KR') as DisplayCard['market'];
  const formulaKey = searchParams.get('formulaKey') ?? 'chart_setup_detected';
  const formula = Object.values(formulaCatalog).find((item) => item.key === formulaKey) ?? formulaCatalog.kr_gainer;

  const card: DisplayCard = {
    id: searchParams.get('cardKey') ?? `${market}:${symbol}`,
    assetKey: searchParams.get('assetKey') ?? `${market}:${symbol}`,
    symbol,
    name,
    market,
    marketLabel: searchParams.get('marketLabel') ?? (market === 'KR' ? '국장' : market),
    theme: searchParams.get('theme'),
    cardType: searchParams.get('cardType') ?? 'kr_runtime',
    title: searchParams.get('title') ?? name,
    primaryReason: searchParams.get('primaryReason') ?? '',
    secondaryReason: searchParams.get('secondaryReason'),
    price: numberFrom(searchParams.get('price')),
    changePct: numberFrom(searchParams.get('changePct')),
    volume: numberFrom(searchParams.get('volume')),
    amount: numberFrom(searchParams.get('amount')),
    labels: searchParams.getAll('label'),
    dataBasisLabel: searchParams.get('dataBasisLabel') ?? '',
    source: searchParams.get('source') ?? 'client-card',
    updatedAt: searchParams.get('updatedAt'),
    tvSymbol: searchParams.get('tvSymbol'),
    coingeckoId: searchParams.get('coingeckoId'),
    binanceSymbol: searchParams.get('binanceSymbol'),
    upbitMarket: searchParams.get('upbitMarket'),
    chartSetupType: searchParams.get('chartSetupType'),
    isWidget: searchParams.get('isWidget') === 'true',
    isMock: searchParams.get('isMock') === 'true',
  };

  if (!symbol || !name) {
    return NextResponse.json({ ok: false, error: 'symbol and name are required' }, { status: 400 });
  }

  const detail = await buildCardDetailData(card, formula);
  return NextResponse.json({ ok: true, detail });
}
