import type { Prisma } from '@prisma/client';
import { runCronJob } from '@/lib/cron/cronRoute';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { fetchSecCompanySubmissions } from '@/lib/providers/us/secEdgar';
import { saveLabels, saveProviderPayload } from '@/lib/providers/pipeline';

type SecRecent = {
  filings?: { recent?: { form?: string[]; filingDate?: string[]; accessionNumber?: string[]; primaryDocument?: string[] } };
};

export async function GET(request: Request) {
  return runCronJob(request, 'us-sec', async () => {
    if (!hasDatabaseUrl()) return { source: 'sec-edgar', saved: 0, skipped: 'DATABASE_URL missing' };
    const assets = await prisma.asset.findMany({ where: { market: 'US', isActive: true, cik: { not: null } }, take: 150 });
    let saved = 0;
    let labels = 0;

    for (const asset of assets) {
      if (!asset.cik) continue;
      const result = await fetchSecCompanySubmissions(asset.cik);
      await saveProviderPayload({ provider: result.source, cacheKey: `US:${asset.symbol}:sec`, payload: result, ttlMinutes: 360 });
      const recent = (result.data as SecRecent | null)?.filings?.recent;
      const forms = recent?.form ?? [];
      for (let index = 0; index < Math.min(forms.length, 10); index += 1) {
        await prisma.newsMention.create({
          data: {
            assetId: asset.id,
            market: 'US',
            keyword: asset.symbol,
            title: `${forms[index]} filing`,
            link: recent?.accessionNumber?.[index] ? `https://www.sec.gov/Archives/edgar/data/${Number(asset.cik)}/${recent.accessionNumber[index].replaceAll('-', '')}/${recent.primaryDocument?.[index] ?? ''}` : undefined,
            publishedAt: recent?.filingDate?.[index] ? new Date(recent.filingDate[index]) : undefined,
            source: result.source,
            raw: { form: forms[index], filingDate: recent?.filingDate?.[index], accessionNumber: recent?.accessionNumber?.[index] } as Prisma.InputJsonValue,
          },
        });
        saved += 1;
      }
      if (forms.length) {
        const labelSaved = await saveLabels({ assetId: asset.id, source: result.source, labels: [{ labelType: 'sec', labelKey: 'recent-sec-filing', displayText: `최근 ${forms[0]} 공시`, grade: ['8-K', '10-Q', '10-K'].includes(forms[0]) ? 'strong' : 'normal', basis: 'SEC EDGAR metadata 기준' }] });
        labels += labelSaved.saved;
      }
    }
    const skippedNoCik = await prisma.asset.count({ where: { market: 'US', isActive: true, cik: null } });
    return { source: 'sec-edgar', assets: assets.length, saved, labels, skippedNoCik };
  });
}
