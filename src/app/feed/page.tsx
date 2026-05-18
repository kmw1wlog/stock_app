import { FeedPageClient } from '@/components/feed/FeedPageClient';
import { MobileShell } from '@/components/layout/MobileShell';

export const dynamic = 'force-dynamic';

export default function FeedPage() {
  return (
    <MobileShell>
      <FeedPageClient />
    </MobileShell>
  );
}
