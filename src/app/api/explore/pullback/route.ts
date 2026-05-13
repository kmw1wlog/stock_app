import { NextResponse } from 'next/server';
import { exploreConfig, getExploreCards } from '@/lib/explore/exploreData';

export async function GET() {
  return NextResponse.json({ ok: true, fallback: true, config: exploreConfig.pullback, cards: getExploreCards('pullback') });
}
