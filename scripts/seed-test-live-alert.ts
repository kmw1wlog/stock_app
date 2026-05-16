import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { DisplayCard } from '@/lib/marketDataTypes';

type LiveAlertTriggerPayload = {
  alertId: string;
  anonUserId: string;
  cardKey: string;
  assetKey: string;
  formulaKey: string;
  triggeredAt: string;
  triggerBasis: {
    fitScore: number;
    alertLine: string;
    matchedReasons: string[];
    riskTags: string[];
  };
  metadata: {
    source: string;
    symbol: string;
    formulaName: string;
    selectorScore: number;
    selectorReasons: string[];
    deliveryStatus: string;
    pushPreview: string;
  };
};

function buildFixtureCard(triggeredAt: string): DisplayCard {
  return {
    id: 'live:005930:A_volume_spike',
    assetKey: '005930',
    symbol: '005930',
    name: '삼성전자',
    market: 'KR',
    marketLabel: '국장',
    theme: '반도체',
    cardType: 'kr_volume',
    title: '삼성전자 실시간 조건식 감지',
    primaryReason: '거래량 3.1배 · 거래대금 2.4배 · 등락률 +2.1%',
    secondaryReason: '장외 smoke 검증용 fixture 카드',
    price: 81200,
    changePct: 2.1,
    amount: 248000000000,
    labels: ['거래량 폭발형', 'fixture', 'MVP smoke'],
    dataBasisLabel: 'fixture runtime alert seed',
    source: 'seed-test-alert',
    updatedAt: triggeredAt,
    tvSymbol: 'KRX:005930',
    chartSetupType: '거래량·거래대금 급증',
    isWidget: false,
    isMock: false,
  };
}

function buildTrigger(triggeredAt: string): LiveAlertTriggerPayload {
  return {
    alertId: 'smoke-live-alert',
    anonUserId: 'smoke_pre_apk_user',
    cardKey: 'smoke_card_005930',
    assetKey: 'KR:005930',
    formulaKey: 'A_volume_spike',
    triggeredAt,
    triggerBasis: {
      fitScore: 96.4,
      alertLine: '거래량 3.1배 · 거래대금 2.4배 · 등락률 +2.1%',
      matchedReasons: ['거래량 3.1배', '거래대금 2.4배', '등락률 +2.1%'],
      riskTags: [],
    },
    metadata: {
      source: 'seed-test-alert',
      symbol: '005930',
      formulaName: '거래량 폭발형',
      selectorScore: 0.91,
      selectorReasons: ['거래량 증가', '거래대금 증가', '상승 마감'],
      deliveryStatus: 'pending',
      pushPreview: '삼성전자 거래량 폭발형 조건이 감지되었습니다.',
    },
  };
}

export async function seedTestLiveAlertFixture() {
  const runtimeDir = path.join(process.cwd(), 'runtime_output', 'realtime_signals');
  const frontendDir = path.join(runtimeDir, 'frontend');
  await mkdir(frontendDir, { recursive: true });

  const triggeredAt = new Date().toISOString();
  const generatedAt = new Date().toISOString();
  const card = buildFixtureCard(triggeredAt);
  const trigger = buildTrigger(triggeredAt);

  const liveFeedPayload = {
    generatedAt,
    source: 'seed-test-alert',
    items: [card],
    cards: [card],
  };
  const liveTriggerPayload = {
    generatedAt,
    source: 'seed-test-alert',
    items: [trigger],
    triggers: [trigger],
  };
  const formulaSignalsPayload = {
    generatedAt,
    source: 'seed-test-alert',
    selectedSymbolCount: 1,
    signals: [
      {
        symbol: '005930',
        name: '삼성전자',
        market: 'KR',
        market_label: '국장',
        theme: '반도체',
        formula_key: 'A_volume_spike',
        formula_name: '거래량 폭발형',
        triggered_at: triggeredAt,
        fit_score: 96.4,
        alert_line: trigger.triggerBasis.alertLine,
        matched_reasons: trigger.triggerBasis.matchedReasons,
        risk_tags: trigger.triggerBasis.riskTags,
        latest_bar: {
          time: Number(new Date(triggeredAt).toISOString().slice(11, 13) + new Date(triggeredAt).toISOString().slice(14, 16)),
          close: 81200,
          cumAmount: 248000000000,
          changePct: 2.1,
        },
        technical_snapshot: {
          timeAdjustedVolumeRatio: 3.1,
          timeAdjustedAmountRatio: 2.4,
          marketRelativeStrengthPct: 2.1,
        },
        selector_score: 0.91,
        selector_reasons: trigger.metadata.selectorReasons,
      },
    ],
  };
  const alertTriggersPayload = {
    generatedAt,
    source: 'seed-test-alert',
    matchedTriggerCount: 1,
    triggers: [trigger],
  };

  await Promise.all([
    writeFile(path.join(frontendDir, 'live-feed.json'), `${JSON.stringify(liveFeedPayload, null, 2)}\n`, 'utf-8'),
    writeFile(path.join(frontendDir, 'live-alert-triggers.json'), `${JSON.stringify(liveTriggerPayload, null, 2)}\n`, 'utf-8'),
    writeFile(path.join(runtimeDir, 'formula_signals_latest.json'), `${JSON.stringify(formulaSignalsPayload, null, 2)}\n`, 'utf-8'),
    writeFile(path.join(runtimeDir, 'alert_triggers_latest.json'), `${JSON.stringify(alertTriggersPayload, null, 2)}\n`, 'utf-8'),
  ]);

  console.log('[PASS] seeded runtime live alert fixture symbol=005930 formula=A_volume_spike');
}

const isDirectRun = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;

if (isDirectRun) {
  seedTestLiveAlertFixture().catch((error) => {
    console.error('[FAIL] seed:test-alert', error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
