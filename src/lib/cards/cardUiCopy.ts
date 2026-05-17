import type { FormulaCandidate, FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import type { DisplayCard } from '@/lib/marketDataTypes';

export type AlertRecommendationCopy = {
  eyebrow: string;
  title: string;
  summary: string;
  expiresLabel: string;
  shareSummary: string;
};

export type FrontInsightBadge = {
  label: string;
  value: string;
  tone: 'primary' | 'neutral' | 'caution';
};

export type FrontAnalysisBlock = {
  label: string;
  summary: string;
};

function hasKeyword(card: DisplayCard, keyword: string) {
  return card.labels.some((label) => label.includes(keyword));
}

function compactTheme(theme?: string | null) {
  if (!theme) return null;
  const trimmed = theme
    .split(/[·,/|]/)[0]
    ?.replace(/\s+/g, ' ')
    .trim();
  if (!trimmed) return null;
  return trimmed.length > 10 ? `${trimmed.slice(0, 10)}…` : trimmed;
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('ko-KR', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

function formatSignedChange(value?: number | null) {
  if (value === null || value === undefined) return '변동 확인 중';
  const arrow = value > 0 ? '▲' : value < 0 ? '▼' : '■';
  return `${arrow} ${Math.abs(value).toFixed(1)}%`;
}

function formatPriceValue(card: DisplayCard) {
  if (card.price === null || card.price === undefined) return '가격 확인 중';
  if (card.market === 'KR') return `${Math.round(card.price).toLocaleString('ko-KR')}원`;
  if (card.market === 'US') return `$${card.price.toLocaleString('en-US', { maximumFractionDigits: card.price >= 100 ? 0 : 2 })}`;
  return card.price.toLocaleString('en-US', { maximumFractionDigits: card.price >= 100 ? 0 : 2 });
}

function formatTradeAmount(card: DisplayCard) {
  if (card.amount === null || card.amount === undefined) return null;
  if (card.market === 'KR') return `거래대금 ${Math.max(1, Math.round(card.amount / 100000000)).toLocaleString('ko-KR')}억`;
  return `거래대금 ${formatCompactNumber(card.amount)}`;
}

function formatVolumeValue(card: DisplayCard) {
  if (card.volume === null || card.volume === undefined) return null;
  if (card.market === 'KR') return `거래량 ${formatCompactNumber(card.volume)}주`;
  return `거래량 ${formatCompactNumber(card.volume)}`;
}

function formatChartPositionShort(card: DisplayCard) {
  const setup = card.chartSetupType ?? '';
  if (/거래대금|거래량/.test(setup)) return '거래 집중형';
  if (/돌파|전고점|상단/.test(setup)) return '돌파 초입';
  if (/눌림|조정/.test(setup)) return '눌림형';
  if (/재도전|재출현|재감지/.test(setup)) return '재도전형';
  if (/박스|횡보/.test(setup)) return '박스 상단';
  if (/신고가/.test(setup)) return '신고가 시도';
  if (setup) return setup.replace(/차트자리|형/g, '').trim() || '흐름 확인';
  if ((card.changePct ?? 0) > 2) return '상승 초입';
  if ((card.changePct ?? 0) < -2) return '조정 구간';
  return '관찰 구간';
}

function buildThemeReason(card: DisplayCard) {
  const theme = compactTheme(card.theme);
  if (!theme) return null;
  return `${theme} 관심`;
}

function buildEventReason(card: DisplayCard) {
  if (hasKeyword(card, '공시') || hasKeyword(card, 'SEC')) return '공시 반응';
  if (hasKeyword(card, '뉴스')) return '뉴스 반응';
  if (card.cardType.includes('news')) return '이슈 반응';
  return null;
}

function buildTradeReason(card: DisplayCard) {
  if (card.amount) return '거래대금 급증';
  if (card.volume) return '거래량 증가';
  return null;
}

function buildMarketMeta(card: DisplayCard) {
  const parts = [compactTheme(card.theme), card.marketLabel].filter(Boolean);
  return parts.join(' · ') || card.marketLabel;
}

function buildInterestValue(card: DisplayCard) {
  let score = 0;
  if ((card.changePct ?? 0) > 0) score += 1;
  if (card.amount) score += 1;
  if (card.chartSetupType) score += 1;
  if (hasKeyword(card, '뉴스') || hasKeyword(card, '공시') || hasKeyword(card, 'SEC')) score += 1;
  if (score >= 3) return '관심 높음';
  if (score >= 2) return '관심 보통';
  return '관찰 중';
}

function buildRiskValue(card: DisplayCard) {
  const abs = Math.abs(card.changePct ?? 0);
  if (abs >= 10) return '과열 주의';
  if (abs >= 6) return '변동성 유의';
  if ((card.changePct ?? 0) < -4) return '낙폭 주의';
  return '위험 낮음';
}

function buildFlowSentence(card: DisplayCard) {
  if (card.amount && hasKeyword(card, '외국인')) return '거래대금이 늘었고 외국인 매수 우위 흐름이 함께 보입니다.';
  if (card.amount) return '거래대금이 평소보다 크게 늘어 시장의 관심이 붙은 구간입니다.';
  if (card.volume) return '거래량이 평소보다 늘어 수급이 붙는지 확인할 구간입니다.';
  return '매수 주체 데이터는 추가 확인이 필요하지만 흐름 자체는 관찰 구간입니다.';
}

export function buildCardEvidenceSentence(card: DisplayCard) {
  const eventReason = buildEventReason(card);
  const chart = formatChartPositionShort(card);
  const trade = buildTradeReason(card);

  if (eventReason && trade) return `${eventReason}과 ${trade}이 함께 나타난 종목입니다.`;
  if (card.chartSetupType) return `차트자리 ${chart} 구간으로 다시 관찰할 만한 종목입니다.`;
  if (trade) return `${trade}이 확인된 종목입니다.`;
  return '기본 관심종목입니다. 실제 데이터 연결 후 판단 지표가 보강됩니다.';
}

export function buildOneLineWhySummary(card: DisplayCard) {
  const rawParts = [
    buildThemeReason(card),
    buildEventReason(card),
    card.chartSetupType ? formatChartPositionShort(card) : null,
    buildTradeReason(card),
  ].filter(Boolean) as string[];
  const parts = rawParts.filter((part, index) => rawParts.indexOf(part) === index);
  return parts.slice(0, 3).join(' + ') || '기본 관심 흐름 + 데이터 연결 대기';
}

export function buildReasonSummary(card: DisplayCard) {
  const theme = compactTheme(card.theme);
  if (hasKeyword(card, '공시') || hasKeyword(card, 'SEC')) {
    return `${theme ? `${theme} 관련 ` : ''}공시 반응 구간입니다.`;
  }
  if (hasKeyword(card, '뉴스')) {
    return `${theme ? `${theme} 관련 ` : ''}뉴스 반응이 붙었습니다.`;
  }
  if (theme && (card.changePct ?? 0) > 0) {
    return `오늘 ${theme} 흐름과 함께 주목받고 있습니다.`;
  }
  if (card.amount || card.volume) {
    return '거래가 커져 피드 상단에 올라왔습니다.';
  }
  return '가격과 거래 흐름을 함께 보는 종목입니다.';
}

export function buildChartPositionSummary(card: DisplayCard) {
  const position = formatChartPositionShort(card);
  if (position === '돌파 초입') return '박스권 상단을 넘기는 초입입니다.';
  if (position === '눌림형') return '눌림 뒤 재상승을 볼 구간입니다.';
  if (position === '재도전형') return '이전 고점을 다시 시험하는 구간입니다.';
  if (position === '박스 상단') return '방향이 정해지는 상단 구간입니다.';
  if (position === '조정 구간') return '조정 뒤 지지 여부를 볼 자리입니다.';
  if (position === '거래 집중형') return '거래가 몰리며 신호가 붙는 구간입니다.';
  return `${position} 구간입니다.`;
}

export function buildFlowSummary(card: DisplayCard) {
  if (card.amount && hasKeyword(card, '외국인')) return '거래 증가와 외국인 매수 우위가 함께 보입니다.';
  if (card.amount) return '거래대금이 늘어 시장 관심이 붙었습니다.';
  if (card.volume) return '거래량이 늘어 수급 변화를 볼 구간입니다.';
  return '매수 주체 데이터는 추가 확인이 필요합니다.';
}

export function buildRiskSummary(card: DisplayCard) {
  const abs = Math.abs(card.changePct ?? 0);
  if (abs >= 10) return '변동폭이 커 추격 리스크가 높습니다.';
  if (abs >= 6) return '단기 변동성이 커 대응이 필요합니다.';
  if ((card.changePct ?? 0) < -4) return '낙폭이 이어질 수 있어 주의가 필요합니다.';
  if (card.isMock) return '일부 지표는 fallback 기준이라 차이가 날 수 있습니다.';
  return '큰 과열 징후는 적지만 흐름 유지 확인이 필요합니다.';
}

export function buildFrontAnalysisBlocks(card: DisplayCard): FrontAnalysisBlock[] {
  return [
    { label: '왜 뜨나요?', summary: buildReasonSummary(card) },
    { label: '어떤 자리인가요?', summary: buildChartPositionSummary(card) },
    { label: '누가 사고 있나요?', summary: buildFlowSummary(card) },
    { label: '뭐가 위험한가요?', summary: buildRiskSummary(card) },
  ];
}

export function buildFrontInsightBadges(card: DisplayCard): FrontInsightBadge[] {
  const interest = buildInterestValue(card);
  const chart = formatChartPositionShort(card);
  const risk = buildRiskValue(card);
  return [
    { label: '관심', value: interest, tone: interest === '관심 높음' ? 'primary' : 'neutral' },
    { label: '차트자리', value: chart, tone: chart === '돌파 초입' ? 'primary' : 'neutral' },
    { label: '위험', value: risk, tone: risk === '위험 낮음' ? 'neutral' : 'caution' },
  ];
}

export function buildSummaryTradeLine(card: DisplayCard) {
  const amount = formatTradeAmount(card);
  const volume = formatVolumeValue(card);
  if (amount && volume) return `${amount} / ${volume}`;
  if (amount) return amount;
  if (volume) return volume;
  return '거래 데이터 추가 확인 중';
}

export function buildSummaryPrice(card: DisplayCard) {
  return formatPriceValue(card);
}

export function buildSummaryChange(card: DisplayCard) {
  return formatSignedChange(card.changePct);
}

export function buildSummaryMeta(card: DisplayCard) {
  return buildMarketMeta(card);
}

export function buildFrontTagLabels(card: DisplayCard, formula: FormulaDefinition) {
  const tags = [card.marketLabel];
  const theme = compactTheme(card.theme);
  if (theme) tags.push(theme);

  switch (card.cardType) {
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
    case 'crypto_live':
    case 'crypto_24h':
      tags.push('코인');
      break;
    case 'us_widget':
    case 'us_sec_event':
      tags.push('미장');
      break;
    default:
      if (hasKeyword(card, '공시') || hasKeyword(card, 'SEC')) tags.push('공시');
      else if (hasKeyword(card, '뉴스')) tags.push('뉴스');
      else if (formula.key === 'chart_setup_detected' || card.chartSetupType) tags.push('신호');
      else if (card.amount || card.volume) tags.push('거래');
      else tags.push('관심');
      break;
  }

  return tags.filter(Boolean).slice(0, 3);
}

export function buildFrontStatusLabel(card: DisplayCard, formula: FormulaDefinition) {
  if (hasKeyword(card, '공시') || hasKeyword(card, 'SEC')) return '공시 확인';
  if (hasKeyword(card, '뉴스')) return '뉴스 확인';
  if (formula.key === 'chart_setup_detected' || card.chartSetupType) return '신호 감지';
  if (card.amount) return '거래 증가';
  if ((card.changePct ?? 0) > 0) return '관심 상승';
  if ((card.changePct ?? 0) < 0) return '조정 관찰';
  return '관찰 중';
}

function formatFormulaAlias(formula: FormulaDefinition) {
  switch (formula.key) {
    case 'kr_gainer_volume_price':
    case 'kr_volume_amount_spike':
      return '거래 신호 알림';
    case 'kr_disclosure_event':
      return '공시 반응 알림';
    case 'kr_news_mention':
    case 'us_widget_sec_event':
      return '이슈 반응 알림';
    case 'chart_setup_detected':
      return '같은 흐름 알림';
    case 'crypto_24h_price_volume':
    case 'crypto_24h_downside':
      return '24시간 흐름 알림';
    case 'kr_loser_watch':
      return '조정 구간 알림';
    default:
      return '같은 흐름 알림';
  }
}

function formatConditionPhrase(formula: FormulaDefinition, card: DisplayCard) {
  switch (formula.key) {
    case 'kr_gainer_volume_price':
      return '거래량과 가격이 다시 붙으면';
    case 'kr_volume_amount_spike':
      return '거래대금이 다시 커지면';
    case 'kr_disclosure_event':
      return '공시 이후 반응이 다시 보이면';
    case 'kr_news_mention':
    case 'us_widget_sec_event':
      return '뉴스 이후 반응이 다시 보이면';
    case 'chart_setup_detected':
      return card.chartSetupType ? `${formatChartPositionShort(card)} 흐름이 다시 보이면` : '같은 흐름이 다시 보이면';
    case 'crypto_24h_price_volume':
    case 'crypto_24h_downside':
      return '24시간 흐름이 다시 커지면';
    case 'kr_loser_watch':
      return '조정 구간에서 반응이 다시 보이면';
    default:
      return '같은 흐름이 다시 보이면';
  }
}

export function buildAlertRecommendationCopy(card: DisplayCard, formula: FormulaDefinition, candidates: FormulaCandidate[]): AlertRecommendationCopy {
  void candidates;
  return {
    eyebrow: '알림 제안',
    title: formatFormulaAlias(formula),
    summary: `${formatConditionPhrase(formula, card)} 알려드려요.`,
    expiresLabel: `${formula.defaultExpiresInDays}일`,
    shareSummary: `${formatFormulaAlias(formula)} · ${formatConditionPhrase(formula, card)}`,
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
    `한 줄 요약: ${buildOneLineWhySummary(card)}`,
    `근거: ${evidenceSentence}`,
    `추천 알림: ${alertCopy.shareSummary}`,
    `조건식: ${formula.name}`,
    `보기: ${detailUrl}`,
    '※ 투자 추천이 아닌 참고용 조건 알림입니다.',
  ].join('\n');
}
