import 'server-only';

import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import type { DisplayCard } from '@/lib/marketDataTypes';
import { fetchKiwoomKrFlow, kiwoomKrFlowMissingEnv } from '@/lib/providers/korea/kiwoomKrData';
import {
  clampScore,
  flowLabel,
  gradeFromScore,
  gradeText,
  shortSellingLabel,
  simpleLabel,
  stars,
  supplyStars,
  volatilityLabel,
  volumeLabel,
  type DiagnosisGrade,
  type DiagnosisLabel,
} from './diagnosisLabels';

export type StockDiagnosis = {
  score: number;
  scoreGrade: DiagnosisGrade;
  scoreLabel: string;
  supplyStars: string;
  supplyHelpText: string;
  leader: string;
  basis: string;
  updatedAt: string | null;
  items: DiagnosisLabel[];
  afterHours: DiagnosisLabel;
};

type DailyPrice = {
  close: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
  amount: number | null;
  changePct: number | null;
  date: Date;
};

function average(values: number[]) {
  if (!values.length) return undefined;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function latestDateKey(date?: string) {
  if (!date || !/^\d{8}$/.test(date)) return new Date();
  return new Date(`${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T00:00:00.000Z`);
}

async function fetchDbContext(card: DisplayCard) {
  if (!hasDatabaseUrl()) return null;
  const asset = await prisma.asset.findFirst({
    where: { OR: [{ id: card.assetKey }, { symbol: card.symbol }] },
    include: {
      dailyPrices: { orderBy: { date: 'desc' }, take: 20 },
      labels: { orderBy: { updatedAt: 'desc' }, take: 8 },
    },
  });
  if (!asset) return null;
  const [flow, afterHours] = await Promise.all([
    prisma.investorFlowDaily.findFirst({ where: { assetId: asset.id }, orderBy: { date: 'desc' } }),
    prisma.afterHoursQuoteDaily.findFirst({ where: { assetId: asset.id }, orderBy: { date: 'desc' } }),
  ]);
  return { asset, flow, afterHours };
}

async function fetchKiwoomContext(card: DisplayCard) {
  if (card.market !== 'KR' || kiwoomKrFlowMissingEnv().length) return null;
  try {
    return await fetchKiwoomKrFlow(card.symbol);
  } catch {
    return null;
  }
}

export async function buildStockDiagnosis(card: DisplayCard): Promise<StockDiagnosis> {
  const db = await fetchDbContext(card);
  const kiwoom = db?.flow ? null : await fetchKiwoomContext(card);
  const prices = (db?.asset.dailyPrices ?? []) as DailyPrice[];
  const latest = prices[0];
  const previousVolumes = prices.slice(1).map((price) => price.volume).filter((value): value is number => Boolean(value));
  const volumeRatio = latest?.volume && previousVolumes.length ? latest.volume / (average(previousVolumes) ?? latest.volume) : undefined;
  const atrRatios = prices
    .map((price) => (price.close && price.high && price.low ? (price.high - price.low) / price.close : undefined))
    .filter((value): value is number => value !== undefined);
  const atrRatio = average(atrRatios.slice(0, 14));

  const institutionNet = db?.flow?.institutionNet ?? kiwoom?.data.latestInvestor?.institution;
  const foreignNet = db?.flow?.foreignNet ?? kiwoom?.data.latestInvestor?.foreigner;
  const individualNet = db?.flow?.individualNet ?? kiwoom?.data.latestInvestor?.individual;
  const shortWeightPct = kiwoom?.data.latestShortSelling?.shortWeightPct;
  const flow = flowLabel(institutionNet, foreignNet);
  const volume = volumeLabel(volumeRatio, latest?.amount ?? card.amount);
  const volatility = volatilityLabel(atrRatio);
  const shortSelling = shortSellingLabel(shortWeightPct);
  const hasDisclosureOrNews = card.labels.some((label) => label.includes('공시') || label.includes('뉴스') || label.includes('SEC'));
  const finance = hasDisclosureOrNews
    ? simpleLabel('재무', '공시 확인 필요', 'neutral', '공시/뉴스 이벤트가 있어 원문 확인이 필요합니다.')
    : simpleLabel('재무', '자료 부족', 'neutral', '재무비율 원천 데이터가 아직 충분하지 않습니다.');
  const valuation = simpleLabel('현재가치', '자료 부족', 'neutral', 'PER/PBR 등 밸류 원천 데이터가 확인되면 라벨을 계산합니다.');
  const sectorMomentum = simpleLabel(
    '업종모멘텀',
    (card.changePct ?? latest?.changePct ?? 0) > 3 ? '강세' : (card.changePct ?? latest?.changePct ?? 0) < -3 ? '약세' : '중립',
    (card.changePct ?? latest?.changePct ?? 0) > 3 ? 'good' : (card.changePct ?? latest?.changePct ?? 0) < -3 ? 'caution' : 'neutral',
    '가격 등락과 테마 라벨을 기준으로 단순 분류했습니다.',
  );
  const afterHours = db?.afterHours
    ? simpleLabel(
        '시간외 반응',
        db.afterHours.afterChangePct === null || db.afterHours.afterChangePct === undefined
          ? '자료 없음'
          : db.afterHours.afterChangePct > 0
            ? '상승'
            : db.afterHours.afterChangePct < 0
              ? '하락'
              : '보합',
        db.afterHours.afterChangePct && db.afterHours.afterChangePct > 0 ? 'good' : 'neutral',
        db.afterHours.basis,
      )
    : simpleLabel('시간외 반응', '자료 없음', 'neutral', '시간외 데이터 제공처 확인 또는 EOD 수집이 필요합니다.');

  let score = 50;
  const changePct = card.changePct ?? latest?.changePct;
  if (changePct !== undefined && changePct !== null) {
    if (changePct > 5) score += 10;
    else if (changePct > 0) score += 5;
    else if (changePct < -5) score -= 8;
  }
  if (volume.value === '폭증') score += 12;
  else if (volume.value === '급증') score += 9;
  else if (volume.value === '증가') score += 5;
  else if (volume.value === '감소') score -= 3;
  if (flow.grade === 'very_good') score += 12;
  else if (flow.grade === 'good') score += 6;
  else if (flow.grade === 'caution') score -= 8;
  if (hasDisclosureOrNews) score += 5;
  if (card.chartSetupType) score += 5;
  if (volatility.grade === 'risk') score -= 12;
  else if (volatility.grade === 'caution') score -= 7;
  if (shortSelling.grade === 'risk') score -= 12;
  else if (shortSelling.grade === 'caution') score -= 7;
  else if (shortSelling.grade === 'good') score += 3;

  const finalScore = clampScore(score);
  const scoreGrade = gradeFromScore(finalScore);
  const starCount = supplyStars(institutionNet, foreignNet);
  const leader =
    institutionNet !== undefined || foreignNet !== undefined || individualNet !== undefined
      ? flow.value
      : card.market === 'KR'
        ? '수급 자료 부족'
        : '시장 데이터 기준';

  return {
    score: finalScore,
    scoreGrade,
    scoreLabel: gradeText(scoreGrade),
    supplyStars: stars(starCount),
    supplyHelpText: flow.helpText,
    leader,
    basis: db?.flow?.basis ?? kiwoom?.basis ?? card.dataBasisLabel,
    updatedAt: db?.flow?.createdAt.toISOString() ?? kiwoom?.fetchedAt ?? card.updatedAt ?? null,
    items: [flow, volume, shortSelling, volatility, finance, valuation, sectorMomentum],
    afterHours,
  };
}

export { latestDateKey };
