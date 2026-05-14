import type { Prisma } from '@prisma/client';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { startJob, finishJob, type JobResult } from '@/lib/jobs/types';
import { saveLabels, saveProviderPayload } from '@/lib/providers/pipeline';
import { recordProviderStatus } from '@/lib/providers/status';
import { fetchSecCompanySubmissions } from '@/lib/providers/us/secEdgar';

type SecRecent = {
  filings?: { recent?: { form?: string[]; filingDate?: string[]; accessionNumber?: string[]; primaryDocument?: string[] } };
};

export async function usSecJob(): Promise<JobResult> {
  const startedAt = startJob();
  if (!process.env.SEC_USER_AGENT) {
    await recordProviderStatus({ provider: 'sec-edgar', dataType: 'us_filings', status: 'missing_env', envMissing: ['SEC_USER_AGENT'] });
    return finishJob({ jobName: 'us-sec', ok: false, provider: 'sec-edgar', startedAt, fetched: 0, normalized: 0, saved: 0, skipped: 0, failed: 0, missingEnv: ['SEC_USER_AGENT'], errors: [] });
  }
  if (!hasDatabaseUrl()) return finishJob({ jobName: 'us-sec', ok: false, provider: 'sec-edgar', startedAt, fetched: 0, normalized: 0, saved: 0, skipped: 0, failed: 1, missingEnv: ['DATABASE_URL'], errors: [{ message: 'DATABASE_URL missing' }] });

  const assets = await prisma.asset.findMany({ where: { market: 'US', isActive: true, cik: { not: null } }, take: 150 });
  let fetched = 0;
  let saved = 0;
  let labels = 0;

  for (const asset of assets) {
    if (!asset.cik) continue;
    const result = await fetchSecCompanySubmissions(asset.cik);
    fetched += 1;
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
      const labelSaved = await saveLabels({
        assetId: asset.id,
        source: result.source,
        labels: [{ labelType: 'sec', labelKey: 'recent-sec-filing', displayText: `최근 ${forms[0]} 공시`, grade: ['8-K', '10-Q', '10-K'].includes(forms[0]) ? 'strong' : 'normal', basis: 'SEC EDGAR metadata 기준' }],
      });
      labels += labelSaved.saved;
    }
  }
  const skippedNoCik = await prisma.asset.count({ where: { market: 'US', isActive: true, cik: null } });
  await recordProviderStatus({ provider: 'sec-edgar', dataType: 'us_filings', status: saved > 0 ? 'success' : 'partial', itemCount: saved, notes: `skippedNoCik=${skippedNoCik}` });
  return finishJob({ jobName: 'us-sec', ok: true, provider: 'sec-edgar', startedAt, fetched, normalized: saved, saved: saved + labels, skipped: skippedNoCik, failed: 0, missingEnv: [], errors: [], metadata: { assets: assets.length, skippedNoCik } });
}
