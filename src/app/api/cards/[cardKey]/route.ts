import { NextResponse } from 'next/server';
import { getStockCard } from '@/data/mockStocks';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';

export async function GET(_request: Request, { params }: { params: Promise<{ cardKey: string }> }) {
  const { cardKey } = await params;

  if (!hasDatabaseUrl()) {
    return NextResponse.json({ ok: true, fallback: true, card: getStockCard(cardKey) });
  }

  const card = await prisma.recommendationCard.findUnique({
    where: { id: cardKey },
    include: { asset: true, formulas: true, snapshots: { orderBy: { calculatedAt: 'desc' }, take: 5 } },
  });

  return NextResponse.json({ ok: true, fallback: !card, card: card ?? getStockCard(cardKey) });
}
