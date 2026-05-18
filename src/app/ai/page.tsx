import { ForYouAiClient } from '@/components/ai/ForYouAiClient';
import { MobileShell } from '@/components/layout/MobileShell';

export const dynamic = 'force-dynamic';

export default function AiPage() {
  return (
    <MobileShell>
      <ForYouAiClient />
    </MobileShell>
  );
}
