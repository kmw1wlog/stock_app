const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const banned = ['프리미엄', '무료 TOP 3', '상위 사용자', '남들이', '저장률 급상승', '놓친 카드', '수익권', '가상추적', '조건식까지 확인한 사용자'];

async function main() {
  const response = await fetch(`${baseUrl}/api/cards/feed`, { cache: 'no-store' });
  const text = await response.text();
  if (!response.ok) {
    console.error(JSON.stringify({ ok: false, status: response.status, body: text.slice(0, 500) }, null, 2));
    process.exit(1);
  }

  const data = JSON.parse(text) as { cards?: Array<{ dataBasisLabel?: string; labels?: string[]; isMock?: boolean }>; items?: Array<{ dataBasisLabel?: string; labels?: string[]; isMock?: boolean }>; message?: string; mode?: string };
  const cards = data.cards ?? data.items ?? [];
  const bannedHits = banned.filter((word) => text.includes(word));
  const invalidCards = cards.filter((card) => !card.dataBasisLabel || card.isMock);

  console.log(JSON.stringify({ ok: bannedHits.length === 0 && invalidCards.length === 0, mode: data.mode, cardCount: cards.length, message: data.message, sample: cards[0] ?? null, bannedHits, invalidCards: invalidCards.length }, null, 2));

  if (bannedHits.length || invalidCards.length) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
