import type { FormulaCandidate, FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';

export type AlertRecommendationCopy = {
  eyebrow: string;
  title: string;
  summary: string;
  conditionLine: string;
  scopeChip: string;
  spreadChip: string;
  expiresLabel: string;
  disclaimer: string;
  detailCtaLabel: string;
  shareSummary: string;
};

function hasKeyword(card: DisplayCard, keyword: string) {
  return card.labels.some((label) => label.includes(keyword));
}

function formatFormulaAlias(formula: FormulaDefinition) {
  switch (formula.key) {
    case 'kr_gainer_volume_price':
    case 'kr_volume_amount_spike':
      return '분봉 조건 A';
    case 'kr_disclosure_event':
    case 'kr_news_mention':
    case 'us_widget_sec_event':
      return '분봉 조건 B';
    case 'chart_setup_detected':
      return '분봉 조건 C';
    case 'crypto_24h_price_volume':
    case 'crypto_24h_downside':
      return '분봉 조건 D';
    case 'kr_loser_watch':
      return '분봉 조건 E';
    default:
      return '분봉 조건';
  }
}

function formatConditionPhrase(formula: FormulaDefinition, card: DisplayCard) {
  switch (formula.key) {
    case 'kr_gainer_volume_price':
      return '거래대금/가격 동시 확인';
    case 'kr_volume_amount_spike':
      return '거래대금 집중 확인';
    case 'kr_disclosure_event':
    case 'kr_news_mention':
    case 'us_widget_sec_event':
      return '뉴스·공시 이벤트 확인';
    case 'chart_setup_detected':
      return '차트자리 재출현 확인';
    case 'crypto_24h_price_volume':
      return '24시간 변동/거래 확인';
    case 'crypto_24h_downside':
      return '24시간 하락 반응 확인';
    case 'kr_loser_watch':
      return '하락 구간 거래 흐름 확인';
    default:
      return card.chartSetupType ? '차트/거래 흐름 확인' : '가격/거래 흐름 확인';
  }
}

export function buildCardEvidenceSentence(card: DisplayCard) {
  const changePct = card.changePct ?? 0;
  const hasAmount = Boolean(card.amount || card.volume);
  const hasChart = Boolean(card.chartSetupType || hasKeyword(card, '차트자리'));
  const hasNews = hasKeyword(card, '뉴스');
  const hasDisclosure = hasKeyword(card, '공시') || hasKeyword(card, 'SEC');

  if ((hasNews || hasDisclosure) && (hasAmount || Math.abs(changePct) >= 1)) {
    return '이 종목은 뉴스 또는 공시 이벤트와 함께 가격·거래 흐름 변화가 확인되어 후속 반응을 살펴볼 후보로 표시됩니다.';
  }
  if (hasChart) {
    return '이 종목은 가격·거래 흐름에서 차트자리 조건이 확인되어 다시 볼 만한 후보로 표시됩니다.';
  }
  if (changePct > 0 && hasAmount) {
    return '오늘 이 종목은 가격 상승과 거래대금 증가가 함께 확인되어 흐름 관찰 대상으로 잡혔습니다.';
  }
  if (changePct < 0 && hasAmount) {
    return '이 종목은 하락 구간에서도 거래 흐름이 확인되어 변동성 관찰 대상으로 표시됩니다.';
  }
  if (hasAmount) {
    return '오늘 이 종목은 거래대금 변화가 확인되어 관심 흐름으로 분류되었습니다.';
  }
  if (hasNews || hasDisclosure) {
    return '이 종목은 뉴스 또는 공시 이벤트가 확인되어 후속 반응을 확인할 필요가 있습니다.';
  }
  return '아직 핵심 데이터가 충분하지 않아 기본 관심종목 기준으로 흐름을 먼저 보여드리고 있습니다.';
}

export function buildAlertRecommendationCopy(card: DisplayCard, formula: FormulaDefinition, candidates: FormulaCandidate[]): AlertRecommendationCopy {
  const alias = formatFormulaAlias(formula);
  const conditionPhrase = formatConditionPhrase(formula, card);
  const alternateCandidate = candidates.find((candidate) => candidate.formula.key !== formula.key);
  const alternatePhrase = alternateCandidate ? formatConditionPhrase(alternateCandidate.formula, card) : undefined;

  return {
    eyebrow: '추천 알림',
    title: '이 흐름이 다시 잡히면 알려드릴게요',
    summary: alternatePhrase
      ? `${conditionPhrase} 중심으로 보고, 필요하면 ${alternatePhrase}까지 같이 확인합니다.`
      : `${conditionPhrase} 기준으로 다시 나타나는지 짧게 관찰합니다.`,
    conditionLine: `${alias} · ${conditionPhrase}`,
    scopeChip: '종단면 · 이 종목 계속 관찰',
    spreadChip: '횡단면 · 비슷한 종목 확산 감시',
    expiresLabel: `${formula.defaultExpiresInDays}일 관찰`,
    disclaimer: '참고 알림이며 매수·매도 추천이 아닙니다.',
    detailCtaLabel: alternateCandidate ? '다른 조건식도 보기' : '조건식 기준 보기',
    shareSummary: `${alias} · ${conditionPhrase}`,
  };
}

export function buildShareText(args: {
  card: DisplayCard;
  formula: FormulaDefinition;
  evidenceSentence: string;
  alertCopy: AlertRecommendationCopy;
  origin?: string;
}) {
  const { card, formula, evidenceSentence, alertCopy, origin } = args;
  const detailUrl = `${origin ?? 'https://stock-app-mu-three.vercel.app'}${`/cards/${encodeURIComponent(card.id)}`}`;
  return [
    `${card.name}(${card.symbol}) 흐름 카드`,
    `한 줄 근거: ${evidenceSentence}`,
    `추천 알림: ${alertCopy.shareSummary}`,
    `조건식: ${formula.name}`,
    `보기: ${detailUrl}`,
    '※ 투자 추천이 아닌 참고용 조건 알림입니다.',
  ].join('\n');
}
