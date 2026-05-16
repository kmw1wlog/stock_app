import { AlertsPageClient } from '@/components/alerts/AlertsPageClient';
import { getLiveAlertTriggers } from '@/lib/realtimeBackend';

export default async function AlertsPage() {
  const initialLiveTriggers = await getLiveAlertTriggers(20);
  return <AlertsPageClient initialLiveTriggers={initialLiveTriggers} />;
}
