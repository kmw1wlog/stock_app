import { Suspense } from 'react';
import { MtsSelectClient } from '@/components/mts/MtsSelectClient';

export default function MtsSelectPage() {
  return (
    <Suspense fallback={null}>
      <MtsSelectClient />
    </Suspense>
  );
}
