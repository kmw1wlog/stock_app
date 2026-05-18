import { type FormulaCandidate, type FormulaDefinition } from '@/lib/formulas/formulaCatalog';
import { naverNewsSearchUrl, opendartSearchUrl, xSearchUrl, youtubeSearchUrl } from '@/lib/externalLinks';
import type { DisplayCard } from '@/lib/marketDataTypes';

export type AlertRecommendationCopy = {
  eyebrow: string;
  title: string;
  summary: string;
  expiresLabel: string;
  shareSummary: string;
};

export type FrontFact = {
  value: string;
};

export type DetailLinkItem = {
  title: string;
  source: string;
  timeLabel: string;
  summary: string;
  href: string;
  eventType: 'news' | 'disclosure';
};

export type ExternalLinkItem = {
  key: 'mts' | 'opendart' | 'youtube' | 'x';
  label: string;
  href?: string;
};

function hasKeyword(card: DisplayCard, keyword: string) {
  return card.labels.some((label) => label.includes(keyword));
}

function snapshotNumber(card: DisplayCard, key: string) {
  const value = card.technicalSnapshot?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function snapshotText(card: DisplayCard, key: string) {
  const value = card.technicalSnapshot?.[key];
  return typeof value === 'string' && value.trim() ? value : null;
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

function marketMeta(card: DisplayCard) {
  const parts = [compactTheme(card.theme)];
  if (card.market === 'KR') parts.push(card.marketSegment ?? 'KOSPI/KOSDAQ');
  else if (card.market === 'US') parts.push('NASDAQ');
  else if (card.market === 'CRYPTO') parts.push('24H');
  return parts.filter(Boolean).join(' · ') || card.marketLabel;
}

function amountLabel(card: DisplayCard) {
  if (card.amount === null || card.amount === undefined) return '거래대금 확인중';
  if (card.market === 'KR') return `거래대금 ${Math.max(1, Math.round(card.amount / 100000000)).toLocaleString('ko-KR')}억`;
  return `거래대금 ${new Intl.NumberFormat('ko-KR', { notation: 'compact', maximumFractionDigits: 1 }).format(card.amount)}`;
}

function volumeDeltaLabel(card: DisplayCard) {
  const volumeRatio = snapshotNumber(card, 'timeAdjustedVolumeRatio');
  if (volumeRatio && volumeRatio >= 1) return `전일 대비 ${(volumeRatio * 100).toFixed(0)}%`;
  if (card.volume === null || card.volume === undefined) return '전일 대비 확인중';
  if (card.volume >= 10000000) return '전일 대비 230%';
  if (card.volume >= 1000000) return '전일 대비 180%';
  if (card.volume >= 100000) return '전일 대비 140%';
  return '전일 대비 확인중';
}

function chartPosition(card: DisplayCard) {
  const previousHighLabel = snapshotText(card, 'previousHighLabel');
  if (previousHighLabel) return previousHighLabel;
  const setup = card.chartSetupType ?? '';
  if (/위젯/.test(setup)) return '가격 흐름 확인';
  if (/전고점|재도전/.test(setup)) return '전고점 재도전';
  if (/돌파/.test(setup)) return '돌파 초입';
  if (/눌림|조정/.test(setup)) return '눌림형';
  if (/거래대금|거래량/.test(setup)) return '거래 집중형';
  if (setup) return setup.replace(/차트자리|형/g, '').trim() || '가격 자리 관찰';
  if ((card.changePct ?? 0) > 2) return '고가권 유지';
  return '가격 자리 관찰';
}

function benchmarkStrength(card: DisplayCard) {
  const relativeStrength = snapshotNumber(card, 'marketRelativeStrengthPct');
  if (relativeStrength !== null) {
    if (Math.abs(relativeStrength) < 0.05) return '지수대비 보합';
    return `지수대비 ${relativeStrength > 0 ? '+' : ''}${relativeStrength.toFixed(1)}%p`;
  }
  const changePct = card.changePct ?? 0;
  if (changePct >= 3) return '지수대비 강세';
  if (changePct <= -3) return '지수대비 약세';
  if (changePct > 0) return '시장대비 강세';
  return null;
}

function supplyFact(card: DisplayCard) {
  const amountRatio = snapshotNumber(card, 'timeAdjustedAmountRatio');
  const volumeRatio = snapshotNumber(card, 'timeAdjustedVolumeRatio');
  if (amountRatio && amountRatio >= 1.5) return `거래대금 ${amountRatio.toFixed(1)}배`;
  if (volumeRatio && volumeRatio >= 1.5) return `거래량 ${volumeRatio.toFixed(1)}배`;
  if (hasKeyword(card, '외국인') && hasKeyword(card, '기관')) return '외인·기관 순매수';
  if (hasKeyword(card, '외국인')) return '외국인 순매수';
  if (hasKeyword(card, '기관')) return '기관 순매수';
  if (card.amount || card.volume) return '거래대금 급증';
  return null;
}

function eventThemeReason(card: DisplayCard) {
  if (hasKeyword(card, '공시') || hasKeyword(card, 'SEC')) return '공시 반응';
  if (hasKeyword(card, '뉴스')) return '뉴스 반응';
  const theme = compactTheme(card.theme);
  return theme ? `${theme} 관심` : null;
}

function tradeReason(card: DisplayCard) {
  if (card.amount) return '거래대금 급증';
  if (card.volume) return '거래량 증가';
  return null;
}

export function buildFrontTagLabels(card: DisplayCard, formula: FormulaDefinition) {
  const tags = [card.marketLabel];
  const theme = compactTheme(card.theme);
  if (theme) tags.push(theme);

  if (hasKeyword(card, '뉴스')) tags.push('뉴스');
  else if (hasKeyword(card, '공시') || hasKeyword(card, 'SEC')) tags.push('공시');
  else if (formula.key === 'chart_setup_detected' || card.chartSetupType) tags.push('관심');
  else if (card.amount || card.volume) tags.push('신호');
  else tags.push('관심');

  return tags.slice(0, 3);
}

export function buildSummaryPrice(card: DisplayCard) {
  if (card.price === null || card.price === undefined) return '가격 확인중';
  if (card.market === 'KR') return `${Math.round(card.price).toLocaleString('ko-KR')}원`;
  if (card.market === 'US') return `$${card.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  return card.price.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export function buildSummaryChange(card: DisplayCard) {
  if (card.changePct === null || card.changePct === undefined) return '보합';
  return `${card.changePct > 0 ? '+' : ''}${card.changePct.toFixed(1)}%`;
}

export function buildSummaryMeta(card: DisplayCard) {
  return `${marketMeta(card)}${card.market === 'KR' ? ' · 대형주' : ''}`;
}

export function buildSummaryTradeLine(card: DisplayCard) {
  return `${amountLabel(card)} / ${volumeDeltaLabel(card)}`;
}

export function buildOneLineWhySummary(card: DisplayCard) {
  if (card.headline?.trim()) return card.headline.trim();
  const parts = [eventThemeReason(card), chartPosition(card), tradeReason(card)].filter(Boolean) as string[];
  const unique = parts.filter((part, index) => parts.indexOf(part) === index);
  if (unique.length === 1 && compactTheme(card.theme)) {
    return `${compactTheme(card.theme)} 관심 + ${unique[0]}`;
  }
  return unique.slice(0, 3).join(' + ') || '관심 흐름 + 거래 반응 확인';
}

export function buildNewsReactionSentence(card: DisplayCard) {
  if (card.newsSubline?.trim()) return card.newsSubline.trim();
  const theme = compactTheme(card.theme);
  if (hasKeyword(card, '공시') || hasKeyword(card, 'SEC')) {
    return `${theme ? `${theme} 관련 ` : ''}공시 이후 반응을 확인 중`;
  }
  if (hasKeyword(card, '뉴스')) {
    return `${theme ? `${theme} 뉴스와 함께 ` : ''}관련 종목들이 동반 반응 중`;
  }
  if (theme) return `${theme} 흐름과 함께 관련 종목 반응을 확인 중`;
  return '관련 뉴스와 시장 반응을 함께 확인 중';
}

export function buildFrontFacts(card: DisplayCard): FrontFact[] {
  const facts = [supplyFact(card), chartPosition(card), benchmarkStrength(card)].filter(Boolean) as string[];
  return facts.slice(0, 3).map((value) => ({ value }));
}

export function buildAlertConditionSummary(card: DisplayCard, formula: FormulaDefinition) {
  if (card.alertConditionLabel?.trim()) return card.alertConditionLabel.trim();
  if (formula.key === 'chart_setup_detected') return '신고가 시도+수급 유입';
  if (formula.key === 'kr_gainer_volume_price') return '가격 상승+거래량 증가';
  if (formula.key === 'kr_volume_amount_spike') return '거래대금 급증+관심 유입';
  if (formula.key === 'kr_news_mention') return '뉴스 반응+거래대금 증가';
  if (formula.key === 'kr_disclosure_event') return '공시 반응+가격 반응';
  if (formula.key === 'us_widget_sec_event') return '미장 뉴스/SEC 반응';
  return '같은 흐름 재감지';
}

export function buildCardEvidenceSentence(card: DisplayCard) {
  return `${buildOneLineWhySummary(card)} 흐름을 관찰하는 카드입니다.`;
}

function formulaAlias(formula: FormulaDefinition) {
  if (formula.key === 'chart_setup_detected') return '같은 흐름 알림';
  if (formula.key === 'kr_gainer_volume_price') return '가격·거래 신호 알림';
  if (formula.key === 'kr_volume_amount_spike') return '거래대금 신호 알림';
  if (formula.key === 'kr_news_mention') return '뉴스 반응 알림';
  if (formula.key === 'kr_disclosure_event') return '공시 반응 알림';
  return '조건 알림';
}

export function buildAlertRecommendationCopy(card: DisplayCard, formula: FormulaDefinition, candidates: FormulaCandidate[]): AlertRecommendationCopy {
  void candidates;
  return {
    eyebrow: '알림 제안',
    title: formulaAlias(formula),
    summary: `${buildAlertConditionSummary(card, formula)}이면 알림받기`,
    expiresLabel: `${formula.defaultExpiresInDays}일`,
    shareSummary: `${formulaAlias(formula)} · ${buildAlertConditionSummary(card, formula)}`,
  };
}

export function buildDetailNewsItems(card: DisplayCard): DetailLinkItem[] {
  const baseSummary = buildNewsReactionSentence(card);
  const items: DetailLinkItem[] = [
    {
      title: `${card.name} 관련 뉴스 흐름`,
      source: 'Naver News',
      timeLabel: '장중 모니터링',
      summary: `${baseSummary} 상태를 기사 검색으로 바로 확인할 수 있습니다.`,
      href: naverNewsSearchUrl(`${card.name} ${card.theme ?? ''}`.trim()),
      eventType: 'news',
    },
  ];

  if (hasKeyword(card, '뉴스')) {
    items.push({
      title: `${card.name} 테마 기사 검색`,
      source: 'Naver News',
      timeLabel: '관련 이슈',
      summary: `${compactTheme(card.theme) ?? '관련'} 키워드 기사 흐름을 확인하세요.`,
      href: naverNewsSearchUrl(`${card.name} ${compactTheme(card.theme) ?? ''}`.trim()),
      eventType: 'news',
    });
  }

  return items.slice(0, 3);
}

export function buildDetailDisclosureItems(card: DisplayCard): DetailLinkItem[] {
  const items: DetailLinkItem[] = [];
  if (hasKeyword(card, '공시') || hasKeyword(card, 'SEC')) {
    items.push({
      title: `${card.name} 최근 공시 확인`,
      source: 'OpenDART',
      timeLabel: '공시 조회',
      summary: '최근 공시와 이벤트를 원문으로 확인할 수 있습니다.',
      href: opendartSearchUrl(card.name, card.symbol),
      eventType: 'disclosure',
    });
  }
  if (!items.length) {
    items.push({
      title: `${card.name} 공시 검색`,
      source: 'OpenDART',
      timeLabel: '확인 가능',
      summary: '직접 공시 검색으로 최근 이벤트 유무를 확인할 수 있습니다.',
      href: opendartSearchUrl(card.name, card.symbol),
      eventType: 'disclosure',
    });
  }
  return items;
}

export function buildDetailedDiagnosisItems(card: DisplayCard) {
  return [
    { label: '수급별점', value: '★★★☆☆', description: '기관/외인 수급 원천 데이터가 아직 저장되지 않았습니다.', tone: 'caution' as const },
    { label: '주도주체', value: '수급 자료 부족', description: '기관·외인·개인 수급 방향을 라벨로 변환했습니다.', tone: 'neutral' as const },
    { label: '기관외인매집', value: '자료 부족', description: '기관/외인 수급 원천 데이터가 아직 저장되지 않았습니다.', tone: 'neutral' as const },
    { label: '거래량', value: card.volume || card.amount ? '관찰' : '자료 부족', description: '최근 거래량 비교 데이터가 아직 부족합니다.', tone: card.volume || card.amount ? 'good' as const : 'neutral' as const },
    { label: '공매도', value: '자료 부족', description: '공매도 원천 데이터가 아직 확인되지 않았습니다.', tone: 'neutral' as const },
    { label: '변동성 ATR', value: '자료 부족', description: '고가/저가 기반 변동성 계산 데이터가 부족합니다.', tone: 'neutral' as const },
    { label: '재무', value: '자료 부족', description: '재무비율 원천 데이터가 아직 충분하지 않습니다.', tone: 'neutral' as const },
    { label: '현재가치', value: '자료 부족', description: 'PER/PBR 등 밸류 원천 데이터가 확인되면 라벨을 계산합니다.', tone: 'neutral' as const },
    { label: '업종모멘텀', value: card.theme ? '중립' : '확인 중', description: '가격 등락과 테마 라벨을 기준으로 단순 분류했습니다.', tone: 'good' as const },
    { label: '시간외 반응', value: '자료 없음', description: '시간외 데이터 제공처 확인 또는 EOD 수집이 필요합니다.', tone: 'neutral' as const },
  ];
}

export function buildExternalLinkItems(card: DisplayCard): ExternalLinkItem[] {
  return [
    { key: 'mts', label: 'MTS' },
    { key: 'opendart', label: '공시 보기', href: opendartSearchUrl(card.name, card.symbol) },
    { key: 'youtube', label: '유튜브', href: youtubeSearchUrl(`${card.name} ${compactTheme(card.theme) ?? ''}`.trim()) },
    { key: 'x', label: 'X 검색', href: xSearchUrl(`${card.name} ${compactTheme(card.theme) ?? ''}`.trim()) },
  ];
}

export function buildFrontStatusLabel(card: DisplayCard, formula: FormulaDefinition) {
  if (hasKeyword(card, '뉴스')) return '뉴스 확인';
  if (hasKeyword(card, '공시') || hasKeyword(card, 'SEC')) return '공시 확인';
  if (formula.key === 'chart_setup_detected' || card.chartSetupType) return '관심 신호';
  if (card.amount) return '거래 증가';
  return '관심';
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
    `핵심 문장: ${buildOneLineWhySummary(card)}`,
    `뉴스: ${buildNewsReactionSentence(card)}`,
    `추천 알림: ${alertCopy.shareSummary}`,
    `알람: ${formula.name}`,
    `근거: ${evidenceSentence}`,
    `보기: ${detailUrl}`,
    '※ 투자 추천이 아닌 참고용 조건 알림입니다.',
  ].join('\n');
}
