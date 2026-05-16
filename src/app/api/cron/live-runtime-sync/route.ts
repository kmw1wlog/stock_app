import { NextResponse } from 'next/server';
import { syncLiveRuntimeToDb } from '@/lib/jobs/liveRuntimeSync';

export async function POST() {
  const result = await syncLiveRuntimeToDb();
  return NextResponse.json(result);
}

export async function GET() {
  const result = await syncLiveRuntimeToDb();
  return NextResponse.json(result);
}
