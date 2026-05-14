export function opendartSearchUrl(name: string, symbol?: string | null) {
  const query = encodeURIComponent(`${name} ${symbol ?? ''}`.trim());
  return `https://dart.fss.or.kr/dsab007/main.do?textCrpNm=${query}`;
}

export function youtubeSearchUrl(name: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(name)}`;
}

export function xSearchUrl(name: string) {
  return `https://x.com/search?q=${encodeURIComponent(name)}&src=typed_query&f=live`;
}

export function naverNewsSearchUrl(name: string) {
  return `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(name)}`;
}
