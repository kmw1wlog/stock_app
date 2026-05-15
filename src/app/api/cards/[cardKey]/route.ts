import { NextResponse } from 'next/server';
import { emptyDataMessage } from '@/lib/dataMode';
import { envelope, getDisplayCard } from '@/lib/marketData';

export async function GET(_request: Request, { params }: { params: Promise<{ cardKey: string }> }) {
  const { cardKey } = await params;
  const card = await getDisplayCard(cardKey);
  const items = card ? [card] : [];
  return NextResponse.json({
    ...envelope(items, card?.source ?? 'provider', card?.dataBasisLabel ?? '공식 API/DB/위젯 기준', {
      message: card ? undefined : emptyDataMessage(),
      fallback: false,
    }),
    card,
  });
}
