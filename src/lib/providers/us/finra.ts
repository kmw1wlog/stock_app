import 'server-only';
import { emptyProviderResult } from '@/lib/providers/types';

export async function fetchFinraShortVolume(symbol: string) {
  return emptyProviderResult('finra', 'FINRA short volume placeholder · provider integration pending', {
    symbol,
    shortPressure: '보통',
  });
}
