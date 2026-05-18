import {
  buildAlertConditionSummary,
  buildCardEvidenceSentence,
  buildFrontFacts,
  buildFrontTagLabels,
  buildNewsReactionSentence,
  buildOneLineWhySummary,
  buildSummaryChange,
  buildSummaryMeta,
  buildSummaryPrice,
  buildSummaryTradeLine,
} from '@/lib/cards/cardUiCopy';
import {
  buildFallbackFrontFacts,
  buildFallbackFrontSummary,
  buildFallbackNewsSentence,
  isFallbackCard,
  sanitizeFrontTags,
  sanitizeFrontText,
} from '@/lib/cards/cardFallbackPolicy';
import type { FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';

export type FrontCardViewModel = {
  tags: string[];
  summaryMeta: string;
  priceLabel: string;
  changeLabel: string;
  tradeLine: string;
  oneLineSummary: string;
  newsSentence: string;
  facts: string[];
  alertCondition: string;
  evidenceSentence: string;
  fallback: boolean;
};

function cleanFact(value: string) {
  const sanitized = sanitizeFrontText(value);
  if (!sanitized) return null;
  if (sanitized.includes('가격 자리')) return '전고점 확인중';
  return sanitized;
}

export function buildFrontCardViewModel(card: DisplayCard, formula: FormulaDefinition): FrontCardViewModel {
  const fallback = isFallbackCard(card);
  const tags = sanitizeFrontTags(buildFrontTagLabels(card, formula)).filter((tag) => tag !== '미국' && tag !== '코인');
  const oneLineSummary = fallback
    ? buildFallbackFrontSummary(card)
    : sanitizeFrontText(buildOneLineWhySummary(card), buildFallbackFrontSummary(card));
  const newsSentence = fallback
    ? buildFallbackNewsSentence(card)
    : sanitizeFrontText(buildNewsReactionSentence(card), buildFallbackNewsSentence(card));
  const facts = fallback
    ? buildFallbackFrontFacts()
    : buildFrontFacts(card)
        .map((fact) => cleanFact(fact.value))
        .filter((fact): fact is string => Boolean(fact))
        .slice(0, 3);

  return {
    tags: tags.length ? tags : ['국장', '관심', '신호'],
    summaryMeta: sanitizeFrontText(buildSummaryMeta(card), card.marketSegment ?? (card.market === 'KR' ? 'KOSPI/KOSDAQ' : '국장')),
    priceLabel: buildSummaryPrice(card),
    changeLabel: buildSummaryChange(card),
    tradeLine: sanitizeFrontText(buildSummaryTradeLine(card), '거래대금 확인중 / 전일 대비 확인중'),
    oneLineSummary,
    newsSentence,
    facts: facts.length ? facts : buildFallbackFrontFacts(),
    alertCondition: sanitizeFrontText(buildAlertConditionSummary(card, formula), '신고가 시도+수급 유입'),
    evidenceSentence: sanitizeFrontText(buildCardEvidenceSentence(card), `${oneLineSummary} 흐름을 관찰하는 카드입니다.`),
    fallback,
  };
}
