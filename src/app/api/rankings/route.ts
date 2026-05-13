import { NextResponse } from 'next/server';
import { getRankingCategories } from '@/lib/rankings/rankingData';

export async function GET() {
  return NextResponse.json({ ok: true, fallback: true, categories: getRankingCategories() });
}
