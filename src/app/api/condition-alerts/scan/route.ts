import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { getFormulaCandidatesForCard } from '@/lib/formulas/formulaCatalog';
import { getDisplayCards } from '@/lib/marketData';

type MatchedTrigger = {
  alertId: string;
  cardKey: string;
  assetKey?: string | null;
  symbol?: string | null;
  formulaKey: string;
  fitScore: number;
  alertLine: string;
  matchedReasons: string[];
  riskTags?: string[];
};

function isActiveAlert(alert: { status: string; expiresAt?: Date | null }) {
  return alert.status === 'active' && (!alert.expiresAt || alert.expiresAt.getTime() > Date.now());
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { anonUserId?: string; minFitScore?: number };
  const minFitScore = body.minFitScore ?? 70;
  const cards = await getDisplayCards(100);
  const candidatesByKey = new Map(
    cards.map((card) => [
      `${card.assetKey}:${card.symbol}`,
      {
        card,
        candidates: getFormulaCandidatesForCard(card),
      },
    ]),
  );

  if (!hasDatabaseUrl()) {
    const fallbackMatches: MatchedTrigger[] = [];
    for (const { card, candidates } of candidatesByKey.values()) {
      const candidate = candidates.find((item) => item.fitScore >= minFitScore);
      if (!candidate) continue;
      fallbackMatches.push({
        alertId: `fallback_${card.id}_${candidate.formula.key}`,
        cardKey: card.id,
        assetKey: card.assetKey,
        symbol: card.symbol,
        formulaKey: candidate.formula.key,
        fitScore: candidate.fitScore,
        alertLine: candidate.alertLine,
        matchedReasons: candidate.matchedReasons,
        riskTags: candidate.riskTags,
      });
    }
    return NextResponse.json({ ok: true, mode: 'fallback', scannedCards: cards.length, created: 0, matches: fallbackMatches.slice(0, 20) });
  }

  const alerts = await prisma.userConditionAlert.findMany({
    where: {
      status: 'active',
      ...(body.anonUserId ? { anonUserId: body.anonUserId } : {}),
    },
    take: 500,
  });

  const matches: MatchedTrigger[] = [];
  for (const alert of alerts.filter(isActiveAlert)) {
    const hit = [...candidatesByKey.values()].find(({ card }) => {
      if (alert.assetKey && card.assetKey !== alert.assetKey) return false;
      if (!alert.assetKey && alert.symbol && card.symbol !== alert.symbol) return false;
      return true;
    });
    if (!hit) continue;
    const candidate = hit.candidates.find((item) => item.formula.key === alert.formulaKey && item.fitScore >= minFitScore);
    if (!candidate) continue;
    matches.push({
      alertId: alert.id,
      cardKey: hit.card.id,
      assetKey: hit.card.assetKey,
      symbol: hit.card.symbol,
      formulaKey: candidate.formula.key,
      fitScore: candidate.fitScore,
      alertLine: candidate.alertLine,
      matchedReasons: candidate.matchedReasons,
      riskTags: candidate.riskTags,
    });
  }

  let created = 0;
  for (const match of matches) {
    await prisma.conditionAlertTrigger.create({
      data: {
        alertId: match.alertId,
        anonUserId: alerts.find((alert) => alert.id === match.alertId)?.anonUserId ?? 'unknown',
        cardKey: match.cardKey,
        assetKey: match.assetKey,
        formulaKey: match.formulaKey,
        triggerBasis: {
          fitScore: match.fitScore,
          alertLine: match.alertLine,
          matchedReasons: match.matchedReasons,
          riskTags: match.riskTags ?? [],
        } as Prisma.InputJsonValue,
        metadata: {
          source: 'condition-alert-scan',
          symbol: match.symbol,
        } as Prisma.InputJsonValue,
      },
    });
    await prisma.userConditionAlert.update({
      where: { id: match.alertId },
      data: { lastTriggeredAt: new Date() },
    });
    created += 1;
  }

  return NextResponse.json({ ok: true, mode: 'live', scannedCards: cards.length, activeAlerts: alerts.length, created, matches: matches.slice(0, 50) });
}
