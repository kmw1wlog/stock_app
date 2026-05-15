export type MtsProvider = {
  code: string;
  displayName: string;
  isSponsored?: boolean;
  priority: number;
  disclosure?: string;
  webUrlTemplate: string;
  playStoreUrl?: string;
  appStoreUrl?: string;
};

export const mtsProviders: MtsProvider[] = [
  {
    code: 'kb',
    displayName: 'KB증권',
    isSponsored: true,
    priority: 1,
    disclosure: '제휴/광고',
    webUrlTemplate: 'https://www.kbsec.com/search?query={symbol}',
    playStoreUrl: 'https://play.google.com/store/search?q=KB%EC%A6%9D%EA%B6%8C&c=apps',
    appStoreUrl: 'https://apps.apple.com/kr/search?term=KB%EC%A6%9D%EA%B6%8C',
  },
  { code: 'kiwoom', displayName: '키움증권', priority: 10, webUrlTemplate: 'https://www.kiwoom.com/search?query={symbol}' },
  { code: 'toss', displayName: '토스증권', priority: 20, webUrlTemplate: 'https://tossinvest.com' },
  { code: 'koreainvest', displayName: '한국투자증권', priority: 30, webUrlTemplate: 'https://www.truefriend.com' },
  { code: 'nh', displayName: 'NH투자증권', priority: 40, webUrlTemplate: 'https://www.nhqv.com' },
  { code: 'mirae', displayName: '미래에셋증권', priority: 50, webUrlTemplate: 'https://securities.miraeasset.com' },
  { code: 'samsung', displayName: '삼성증권', priority: 60, webUrlTemplate: 'https://www.samsungpop.com' },
];

export function buildMtsUrl(provider: MtsProvider, symbol?: string | null) {
  return provider.webUrlTemplate.replace('{symbol}', encodeURIComponent(symbol ?? ''));
}

export function sortedMtsProviders() {
  return [...mtsProviders].sort((a, b) => a.priority - b.priority);
}
