import { AlertsPageClient } from '@/components/alerts/AlertsPageClient';

export const dynamic = 'force-dynamic';

export default function AlertsPage() {
  return <AlertsPageClient initialLiveTriggers={[]} fetchOnMount />;
}
