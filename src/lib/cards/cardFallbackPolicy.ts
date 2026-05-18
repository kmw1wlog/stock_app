import type { DisplayCard } from '@/lib/marketDataTypes';

const bannedFrontPhrases = [
  '기본 관심종목',
  '공식 데이터 연결 대기',
  '로컬 fallback',
  'fast fallback',
  'shell-first',
  'default-watchlist',
  '데이터 준비중',
  '가격 자리 관찰',
  '관심 흐름 + 거래 반응 확인',
];

function compactTheme(theme?: string | null) {
  const value = theme?.split(/[·,/|]/)[0]?.replace(/\s+/g, ' ').trim();
  if (!value) return '국장';
  return value.length > 10 ? `${value.slice(0, 10)}…` : value;
}

export function isFallbackCard(card: DisplayCard) {
  const joined = [
    card.id,
    card.source,
    card.dataBasisLabel,
    card.title,
    card.primaryReason,
    card.secondaryReason,
    card.cardType,
    ...card.labels,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return (
    card.isMock === true ||
    card.id.startsWith('fallback-') ||
    /fallback|default-watchlist|shell-first|mock|fixture|local/.test(joined) ||
    bannedFrontPhrases.some((phrase) => joined.includes(phrase.toLowerCase()))
  );
}

export function sanitizeFrontText(value: string | null | undefined, fallback = '') {
  if (!value) return fallback;
  let next = value;
  for (const phrase of bannedFrontPhrases) {
    next = next.replaceAll(phrase, '').replaceAll(phrase.toLowerCase(), '');
  }
  next = next
    .replace(/\s+\+\s+\+/g, ' + ')
    .replace(/^[\s+·|/,-]+|[\s+·|/,-]+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return next || fallback;
}

export function buildFallbackFrontSummary(card: DisplayCard) {
  return `${compactTheme(card.theme)} 테마 관심 + 시장 흐름 확인`;
}

export function buildFallbackNewsSentence(card: DisplayCard) {
  const theme = compactTheme(card.theme);
  return theme === '국장'
    ? '실시간 데이터 연결 전에도 주요 종목 흐름을 확인할 수 있습니다.'
    : `${theme} 흐름과 함께 주요 종목 반응을 확인할 수 있습니다.`;
}

export function buildFallbackFrontFacts() {
  return ['거래 확인중', '전고점 확인중', '지수대비 확인중'];
}

export function sanitizeFrontTags(tags: string[]) {
  return tags
    .map((tag) => sanitizeFrontText(tag))
    .filter(Boolean)
    .map((tag) => (tag === '차트자리' ? '신호' : tag))
    .slice(0, 3);
}
