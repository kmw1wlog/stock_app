import type { Prisma } from '@prisma/client';
import { hasDatabaseUrl, prisma } from '@/lib/db/prisma';
import { getLiveAlertTriggers, getLiveFormulaSignals } from '@/lib/realtimeBackend';

type OptionalRealtimeDelegates = {
  assetTaFeature?: {
    upsert(args: {
      where: Record<string, unknown>;
      update: Record<string, unknown>;
      create: Record<string, unknown>;
    }): Promise<unknown>;
  };
  formulaSignal?: {
    findFirst(args: {
      where: Record<string, unknown>;
      select: { id: true };
    }): Promise<{ id: string } | null>;
    create(args: {
      data: Record<string, unknown>;
    }): Promise<unknown>;
  };
};

export async function syncLiveRuntimeToDb() {
  const signals = await getLiveFormulaSignals(300);
  const triggers = await getLiveAlertTriggers(300);

  if (!hasDatabaseUrl()) {
    return {
      ok: true,
      mode: 'fallback',
      syncedSignals: 0,
      syncedTriggers: 0,
      availableSignals: signals.length,
      availableTriggers: triggers.length,
    };
  }

  const optionalDelegates = prisma as typeof prisma & OptionalRealtimeDelegates;

  const assetIds = new Map<string, string>();
  for (const signal of signals) {
    const market = signal.market === 'KR' ? 'KR' : signal.market;
    const asset = await prisma.asset.upsert({
      where: { market_symbol: { market, symbol: signal.symbol } },
      update: {
        name: signal.name,
        theme: signal.theme ?? undefined,
        isActive: true,
      },
      create: {
        market,
        symbol: signal.symbol,
        name: signal.name,
        theme: signal.theme ?? undefined,
        exchange: market === 'KR' ? 'KRX' : undefined,
        isActive: true,
      },
      select: { id: true },
    });
    assetIds.set(`${market}:${signal.symbol}`, asset.id);

    const triggeredAt = new Date(signal.triggered_at);
    await prisma.assetPriceIntraday.upsert({
      where: {
        assetId_interval_time_source: {
          assetId: asset.id,
          interval: '1m',
          time: triggeredAt,
          source: 'realtime-backend',
        },
      },
      update: {
        close: signal.latest_bar.close ?? undefined,
        amount: signal.latest_bar.cumAmount ?? undefined,
        raw: signal.latest_bar as Prisma.InputJsonValue,
      },
      create: {
        assetId: asset.id,
        interval: '1m',
        time: triggeredAt,
        close: signal.latest_bar.close ?? undefined,
        amount: signal.latest_bar.cumAmount ?? undefined,
        source: 'realtime-backend',
        raw: signal.latest_bar as Prisma.InputJsonValue,
      },
    });

    if (optionalDelegates.assetTaFeature) {
      await optionalDelegates.assetTaFeature.upsert({
        where: {
          assetId_time_interval_source: {
            assetId: asset.id,
            time: triggeredAt,
            interval: '1m',
            source: 'realtime-backend',
          },
        },
        update: {
          featuresJson: (signal.technical_snapshot ?? {}) as Prisma.InputJsonValue,
        },
        create: {
          assetId: asset.id,
          time: triggeredAt,
          interval: '1m',
          source: 'realtime-backend',
          featuresJson: (signal.technical_snapshot ?? {}) as Prisma.InputJsonValue,
        },
      });
    }

    const existingSignal = optionalDelegates.formulaSignal
      ? await optionalDelegates.formulaSignal.findFirst({
          where: {
            assetId: asset.id,
            formulaKey: signal.formula_key,
            triggeredAt,
            source: 'realtime-backend',
          },
          select: { id: true },
        })
      : null;

    if (!existingSignal && optionalDelegates.formulaSignal) {
      await optionalDelegates.formulaSignal.create({
        data: {
          assetId: asset.id,
          formulaKey: signal.formula_key,
          formulaName: signal.formula_name,
          triggeredAt,
          fitScore: signal.fit_score,
          alertLine: signal.alert_line,
          matchedReasons: signal.matched_reasons as Prisma.InputJsonValue,
          riskTags: signal.risk_tags as Prisma.InputJsonValue,
          featuresJson: {
            latestBar: signal.latest_bar,
            technicalSnapshot: signal.technical_snapshot ?? {},
            selectorScore: signal.selector_score ?? null,
            selectorReasons: signal.selector_reasons ?? [],
          } as Prisma.InputJsonValue,
          source: 'realtime-backend',
          phase: undefined,
        },
      });
    }
  }

  let syncedTriggers = 0;
  for (const trigger of triggers) {
    const existing = await prisma.conditionAlertTrigger.findFirst({
      where: {
        alertId: trigger.alertId,
        cardKey: trigger.cardKey,
        triggeredAt: new Date(trigger.triggeredAt),
      },
      select: { id: true },
    });
    if (existing) continue;
    await prisma.conditionAlertTrigger.create({
      data: {
        alertId: trigger.alertId,
        anonUserId: trigger.anonUserId,
        cardKey: trigger.cardKey,
        assetKey: trigger.assetKey ?? undefined,
        formulaKey: trigger.formulaKey ?? undefined,
        triggeredAt: new Date(trigger.triggeredAt),
        triggerBasis: (trigger.triggerBasis ?? {}) as Prisma.InputJsonValue,
        metadata: (trigger.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
    syncedTriggers += 1;
  }

  return {
    ok: true,
    mode: 'live',
    syncedSignals: signals.length,
    syncedTriggers,
    availableSignals: signals.length,
    availableTriggers: triggers.length,
  };
}
