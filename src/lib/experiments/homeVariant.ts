'use client';

export type HomeVariant = 'A' | 'B' | 'C';

const storageKey = 'stock-app-home-variant';

export function getHomeVariant(): HomeVariant {
  const existing = window.localStorage.getItem(storageKey);
  if (existing === 'A' || existing === 'B' || existing === 'C') {
    return existing;
  }

  const variants: HomeVariant[] = ['A', 'B', 'C'];
  const variant = variants[Math.floor(Math.random() * variants.length)];
  window.localStorage.setItem(storageKey, variant);
  return variant;
}
