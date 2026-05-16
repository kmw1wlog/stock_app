import { HomePageClient } from '@/components/home/HomePageClient';
import { getDisplayCards } from '@/lib/marketData';

export default async function HomePage() {
  const cards = await getDisplayCards(50);
  return <HomePageClient initialCards={cards} />;
}
