import { NextResponse } from 'next/server';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { fetchKiwoomKrFlow, kiwoomKrFlowMissingEnv } from '@/lib/providers/korea/kiwoomKrData';

function toDate(value?: string) {
  if (!value || !/^\d{8}$/.test(value)) return new Date();
  return new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T00:00:00.000Z`);
}

export async function GET() {
  const missingEnv = kiwoomKrFlowMissingEnv();
  if (missingEnv.length) {
    return NextResponse.json({ ok: false, message: 'KIWOOM_APP_KEY/KIWOOM_SECRET_KEY 필요', missingEnv });
  }
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ ok: false, message: 'DATABASE_URL 필요', missingEnv: ['DATABASE_URL'] });
  }

  const assets = await prisma.asset.findMany({ where: { market: 'KR', isActive: true }, select: { id: true, symbol: true }, take: 60 });
  let saved = 0;
  const errors: Array<{ symbol: string; message: string }> = [];

  for (const asset of assets) {
    try {
      const result = await fetchKiwoomKrFlow(asset.symbol);
      const investor = result.data.latestInvestor;
      if (!investor) continue;
      await prisma.investorFlowDaily.upsert({
        where: { assetId_date_source: { assetId: asset.id, date: toDate(investor.date), source: result.source } },
        update: {
          institutionNet: investor.institution,
          foreignNet: investor.foreigner,
          individualNet: investor.individual,
          basis: result.basis,
          raw: result.raw as object,
        },
        create: {
          assetId: asset.id,
          date: toDate(investor.date),
          institutionNet: investor.institution,
          foreignNet: investor.foreigner,
          individualNet: investor.individual,
          source: result.source,
          basis: result.basis,
          raw: result.raw as object,
        },
      });
      saved += 1;
    } catch (error) {
      errors.push({ symbol: asset.symbol, message: error instanceof Error ? error.message : String(error) });
    }
  }

  return NextResponse.json({ ok: errors.length === 0, fetched: assets.length, saved, failed: errors.length, errors, cadence: 'EOD 16:10~17:30 KST 1회' });
}
