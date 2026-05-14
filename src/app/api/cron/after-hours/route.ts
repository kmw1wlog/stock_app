import { NextResponse } from 'next/server';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { fetchAfterHoursQuote } from '@/lib/providers/korea/afterHours';
import { kiwoomKrFlowMissingEnv } from '@/lib/providers/korea/kiwoomKrData';

export async function GET() {
  const missingEnv = kiwoomKrFlowMissingEnv();
  if (missingEnv.length) {
    return NextResponse.json({ ok: false, message: '시간외 데이터 제공처 확인 필요 · Kiwoom API 키 필요', missingEnv });
  }
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ ok: false, message: 'DATABASE_URL 필요', missingEnv: ['DATABASE_URL'] });
  }

  const assets = await prisma.asset.findMany({ where: { market: 'KR', isActive: true }, select: { id: true, symbol: true }, take: 60 });
  let saved = 0;
  const errors: Array<{ symbol: string; message: string }> = [];

  for (const asset of assets) {
    try {
      const result = await fetchAfterHoursQuote(asset.symbol);
      if (!result.data) continue;
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      await prisma.afterHoursQuoteDaily.upsert({
        where: { assetId_date_source_sessionType: { assetId: asset.id, date, source: result.source, sessionType: result.data.sessionType } },
        update: {
          afterPrice: result.data.afterPrice,
          afterChangePct: result.data.afterChangePct,
          afterVolume: result.data.afterVolume,
          afterAmount: result.data.afterAmount,
          basis: result.basis,
          raw: result.data.raw as object,
        },
        create: {
          assetId: asset.id,
          date,
          afterPrice: result.data.afterPrice,
          afterChangePct: result.data.afterChangePct,
          afterVolume: result.data.afterVolume,
          afterAmount: result.data.afterAmount,
          sessionType: result.data.sessionType,
          source: result.source,
          basis: result.basis,
          raw: result.data.raw as object,
        },
      });
      saved += 1;
    } catch (error) {
      errors.push({ symbol: asset.symbol, message: error instanceof Error ? error.message : String(error) });
    }
  }

  return NextResponse.json({ ok: errors.length === 0, fetched: assets.length, saved, failed: errors.length, errors, cadence: 'EOD 18:20~19:00 KST 1회' });
}
