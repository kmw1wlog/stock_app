import type { FormulaCandidate, FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';

export type AlertRecommendationCopy = {
  eyebrow: string;
  title: string;
  summary: string;
  expiresLabel: string;
  shareSummary: string;
};

function hasKeyword(card: DisplayCard, keyword: string) {
  return card.labels.some((label) => label.includes(keyword));
}

function formatFormulaAlias(formula: FormulaDefinition) {
  switch (formula.key) {
    case 'kr_gainer_volume_price':
    case 'kr_volume_amount_spike':
      return '거래 흐름 재감지';
    case 'kr_disclosure_event':
    case 'kr_news_mention':
    case 'us_widget_sec_event':
      return '이벤트 반응 재감지';
    case 'chart_setup_detected':
      return '흐름 재감지';
    case 'crypto_24h_price_volume':
    case 'crypto_24h_downside':
      return '24시간 흐름 재감지';
    case 'kr_loser_watch':
      return '하락 구간 재감지';
    default:
      return '흐름 재감지';
  }
}

function formatConditionPhrase(formula: FormulaDefinition, card: DisplayCard) {
  switch (formula.key) {
    case 'kr_gainer_volume_price':
      return '거래가 다시 붙는지';
    case 'kr_volume_amount_spike':
      return '거래가 다시 커지는지';
    case 'kr_disclosure_event':
    case 'kr_news_mention':
    case 'us_widget_sec_event':
      return '뉴스 이후 반응이 이어지는지';
    case 'chart_setup_detected':
      return '같은 흐름이 다시 나오는지';
    case 'crypto_24h_price_volume':
      return '24시간 흐름이 다시 커지는지';
    case 'crypto_24h_downside':
      return '하락 반응이 다시 이어지는지';
    case 'kr_loser_watch':
      return '조정 구간 반응이 이어지는지';
    default:
      return card.chartSetupType ? '같은 흐름이 이어지는지' : '가격·거래 흐름이 이어지는지';
  }
}

export function buildCardEvidenceSentence(card: DisplayCard) {
  const changePct = card.changePct ?? 0;
  const hasAmount = Boolean(card.amount || card.volume);
  const hasChart = Boolean(card.chartSetupType || hasKeyword(card, '차트자리'));
  const hasNews = hasKeyword(card, '뉴스');
  const hasDisclosure = hasKeyword(card, '공시') || hasKeyword(card, 'SEC');

  if ((hasNews || hasDisclosure) && (hasAmount || Math.abs(changePct) >= 1)) {
    return '뉴스나 공시 이후 반응을 확인할 종목입니다.';
  }
  if (hasChart) {
    return '같은 흐름이 다시 잡힌 종목입니다.';
  }
  if (changePct > 0 && hasAmount) {
    return '가격과 거래 흐름이 함께 커진 종목입니다.';
  }
  if (changePct < 0 && hasAmount) {
    return '하락 구간에서도 거래 반응이 확인된 종목입니다.';
  }
  if (hasAmount) {
    return '거래 흐름이 평소보다 커진 종목입니다.';
  }
  if (hasNews || hasDisclosure) {
    return '뉴스나 공시 이벤트를 확인할 필요가 있는 종목입니다.';
  }
  return '기본 관심종목입니다. 실제 데이터 연결 후 판단 지표가 보강됩니다.';
}

export function buildAlertRecommendationCopy(card: DisplayCard, formula: FormulaDefinition, candidates: FormulaCandidate[]): AlertRecommendationCopy {
  const alias = formatFormulaAlias(formula);
  const conditionPhrase = formatConditionPhrase(formula, card);
  void candidates;

  const summary =
    formula.key === 'chart_setup_detected'
      ? '같은 흐름이 다시 보이면 알려드려요.'
      : formula.key === 'kr_gainer_volume_price' || formula.key === 'kr_volume_amount_spike'
        ? '거래가 다시 붙으면 알려드려요.'
        : formula.key === 'kr_disclosure_event' || formula.key === 'kr_news_mention' || formula.key === 'us_widget_sec_event'
          ? '뉴스 이후 반응이 잡히면 알려드려요.'
          : '같은 흐름이 다시 보이면 알려드려요.';

  return {
    eyebrow: '알림 제안',
    title: alias,
    summary,
    expiresLabel: `${formula.defaultExpiresInDays}일 관찰`,
    shareSummary: `${alias} · ${conditionPhrase}`,
  };
}

function shortThemeLabel(theme?: string | null) {
  if (!theme) return null;
  const trimmed = theme
    .split(/[·,/|]/)[0]
    ?.replace(/\s+/g, ' ')
    .trim();
  if (!trimmed) return null;
  return trimmed.length > 10 ? `${trimmed.slice(0, 10)}…` : trimmed;
}

export function buildFrontTagLabels(card: DisplayCard, formula: FormulaDefinition) {
  const tags = [card.marketLabel];
  const theme = shortThemeLabel(card.theme);
  if (theme) tags.push(theme);

  switch (card.cardType) {
    case 'kr_volume':
    case 'kr_amount':
      tags.push('거래');
      break;
    case 'kr_news':
      tags.push('뉴스');
      break;
    case 'kr_disclosure':
      tags.push('공시');
      break;
    case 'kr_gainer':
      tags.push('상승');
      break;
    case 'kr_loser':
      tags.push('하락');
      break;
    case 'us_widget':
    case 'us_sec_event':
      tags.push('미장');
      break;
    case 'crypto_live':
    case 'crypto_24h':
      tags.push('코인');
      break;
    default:
      if (card.chartSetupType || hasKeyword(card, '차트자리') || formula.key === 'chart_setup_detected') tags.push('신호');
      else if (hasKeyword(card, '뉴스') || hasKeyword(card, '공시') || hasKeyword(card, 'SEC')) tags.push('이벤트');
      else if (card.amount || card.volume || /volume|amount/.test(formula.key)) tags.push('거래');
      else tags.push('관심');
      break;
  }

  return tags.filter(Boolean).slice(0, 3);
}

export function buildFrontStatusLabel(card: DisplayCard, formula: FormulaDefinition) {
  if (hasKeyword(card, '뉴스')) return '뉴스 확인';
  if (hasKeyword(card, '공시') || hasKeyword(card, 'SEC')) return '공시 확인';
  if (formula.key === 'chart_setup_detected' || card.chartSetupType || hasKeyword(card, '차트자리')) return '신호 감지';
  if (formula.key === 'kr_gainer_volume_price' || formula.key === 'kr_volume_amount_spike' || card.amount || card.volume) return '거래 증가';
  if ((card.changePct ?? 0) > 0) return '상승 흐름';
  if ((card.changePct ?? 0) < 0) return '하락 관찰';
  if (card.market === 'US') return '미장 추적';
  if (card.market === 'CRYPTO') return '코인 추적';
  return '관찰중';
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
    `근거: ${evidenceSentence}`,
    `추천 알림: ${alertCopy.shareSummary}`,
    `조건식: ${formula.name}`,
    `보기: ${detailUrl}`,
    '※ 투자 추천이 아닌 참고용 조건 알림입니다.',
  ].join('\n');
}
