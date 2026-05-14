import { NextResponse } from 'next/server';
import { getExplorePayload } from '@/lib/exploreLive';

export async function GET() {
  return NextResponse.json(await getExplorePayload('amount'));
}
