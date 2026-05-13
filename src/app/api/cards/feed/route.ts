import { NextResponse } from 'next/server';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { stockCards } from '@/data/mockStocks';

export async function GET() {
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ ok: true, fallback: true, cards: stockCards });
  }

  const cards = await prisma.recommendationCard.findMany({
    where: { status: 'active' },
    include: { asset: true },
    orderBy: { detectedAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({ ok: true, fallback: cards.length === 0, cards: cards.length ? cards : stockCards });
}
