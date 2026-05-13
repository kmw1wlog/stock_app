import { NextResponse } from 'next/server';
import { getReportData } from '@/lib/report/reportData';

export async function GET() {
  return NextResponse.json({ ok: true, fallback: true, report: getReportData() });
}
