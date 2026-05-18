import { Suspense } from 'react';
import { AlertBrowsePageClient } from '@/components/alerts/AlertBrowsePageClient';
import { MobileShell } from '@/components/layout/MobileShell';

export const dynamic = 'force-dynamic';

export default function AlertBrowsePage() {
  return (
    <MobileShell>
      <Suspense fallback={<div className="p-6 text-sm font-bold text-slate-500">알람 목록을 불러오는 중입니다.</div>}>
        <AlertBrowsePageClient />
      </Suspense>
    </MobileShell>
  );
}
