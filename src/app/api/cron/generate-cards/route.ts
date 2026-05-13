import { runCronJob } from '@/lib/cron/cronRoute';
import { generateCardFromLabels } from '@/lib/cards/cardGenerator';
import { buildKoreaLabels } from '@/lib/labels/koreaLabels';

export async function GET(request: Request) {
  return runCronJob(request, 'generate-cards', async () => {
    const labels = buildKoreaLabels({ market: 'KR', newsCount: 3, communityScore: 70, volumeRatio: 2 });
    const card = generateCardFromLabels({
      market: 'KR',
      symbol: '277810',
      name: '레인보우로보틱스',
      theme: '로봇',
      labels,
      returnToHighPct: 6.8,
    });
    return { generated: 1, cardType: card.cardType, dataBasisLabel: card.dataBasisLabel };
  });
}
