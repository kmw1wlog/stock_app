'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setMixpanelSuperProperties, trackMixpanelEvent } from '@/lib/analytics/mixpanelClient';
import { flushPendingSyncQueue, getAnonymousId, queuePendingSync, registerAnonymousUser } from '@/lib/user/anonymousUser';
import { syncUserCardState, syncUserFormulaState, type UserCardStateAction } from '@/lib/user/userCardState';

export type UserState = {
  savedCardIds: string[];
  likedCardIds: string[];
  hiddenCardIds: string[];
  copiedFormulaIds: string[];
  trackingCardIds: string[];
  preferredMarkets: string[];
  eventLog: Array<{
    eventName: string;
    payload?: Record<string, unknown>;
    createdAt: string;
  }>;
};

type AppStateContextValue = {
  state: UserState;
  toast: string | null;
  anonymousId: string | null;
  saveCard: (id: string, metadata?: Record<string, unknown>) => void;
  likeCard: (id: string, metadata?: Record<string, unknown>) => void;
  hideCard: (id: string, metadata?: Record<string, unknown>) => void;
  copyFormula: (id: string, metadata?: Record<string, unknown>) => void;
  trackCard: (id: string, metadata?: Record<string, unknown>) => void;
  setPreferredMarkets: (markets: string[]) => void;
  showToast: (message: string) => void;
  logEvent: (eventName: string, payload?: Record<string, unknown>) => void;
};

const defaultState: UserState = {
  savedCardIds: [],
  likedCardIds: [],
  hiddenCardIds: [],
  copiedFormulaIds: [],
  trackingCardIds: [],
  preferredMarkets: [],
  eventLog: [],
};

const AppStateContext = createContext<AppStateContextValue | null>(null);
const storageKey = 'stock-app-user-state';

function normalizeEventPayload(payload?: Record<string, unknown>, anonymousId?: string | null) {
  const cardKey = typeof payload?.cardKey === 'string' ? payload.cardKey : typeof payload?.cardId === 'string' ? payload.cardId : undefined;
  return {
    anon_user_id: anonymousId,
    home_variant: typeof payload?.homeVariant === 'string' ? payload.homeVariant : undefined,
    card_key: cardKey,
    asset_key: typeof payload?.assetKey === 'string' ? payload.assetKey : undefined,
    symbol: typeof payload?.symbol === 'string' ? payload.symbol : undefined,
    market: typeof payload?.market === 'string' ? payload.market : undefined,
    theme: typeof payload?.theme === 'string' ? payload.theme : undefined,
    card_type: typeof payload?.cardType === 'string' ? payload.cardType : undefined,
    chart_seat_type: typeof payload?.chartSetupType === 'string' ? payload.chartSetupType : undefined,
    filter_market: typeof payload?.filterMarket === 'string' ? payload.filterMarket : undefined,
    filter_intent: typeof payload?.filterIntent === 'string' ? payload.filterIntent : undefined,
    source_label: typeof payload?.sourceLabel === 'string' ? payload.sourceLabel : undefined,
    data_basis: typeof payload?.dataBasis === 'string' ? payload.dataBasis : typeof payload?.dataBasisLabel === 'string' ? payload.dataBasisLabel : undefined,
    is_mock: payload?.isMock ?? true,
    is_widget: payload?.isWidget ?? false,
    is_premium: payload?.isPremium ?? false,
    platform: typeof payload?.platform === 'string' ? payload.platform : undefined,
    position_index: typeof payload?.positionIndex === 'number' ? payload.positionIndex : undefined,
    preferred_markets: payload?.preferredMarkets,
    ...payload,
  };
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UserState>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);

  useEffect(() => {
    const anonUserId = getAnonymousId();
    setAnonymousId(anonUserId);

    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? ({ ...defaultState, ...JSON.parse(raw) } as UserState) : defaultState;
    setState(parsed);

    setMixpanelSuperProperties({
      anon_user_id: anonUserId,
      preferred_markets: parsed.preferredMarkets,
    });
    registerAnonymousUser({
      deviceType: window.matchMedia('(pointer: coarse)').matches ? 'mobile' : 'desktop',
      appVersion: 'phase1-vnext',
      preferredMarkets: parsed.preferredMarkets,
    }).catch(() => undefined);
    flushPendingSyncQueue().catch(() => undefined);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    }
  }, [hydrated, state]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  }, []);

  const logEvent = useCallback(
    (eventName: string, payload?: Record<string, unknown>) => {
      const anonUserId = anonymousId ?? getAnonymousId();
      const normalized = normalizeEventPayload(payload, anonUserId);
      const entry = { eventName, payload: normalized, createdAt: new Date().toISOString() };

      setState((current) => ({
        ...current,
        eventLog: [entry, ...(current.eventLog ?? [])].slice(0, 200),
      }));
      trackMixpanelEvent(eventName, normalized);

      const body = {
        anonUserId,
        eventType: eventName,
        cardKey: typeof normalized.card_key === 'string' ? normalized.card_key : undefined,
        assetId: typeof payload?.assetId === 'string' ? payload.assetId : undefined,
        market: typeof normalized.market === 'string' ? normalized.market : undefined,
        metadata: normalized,
      };

      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
        .then((response) => {
          if (!response.ok) {
            queuePendingSync({ url: '/api/events', method: 'POST', payload: body });
          }
        })
        .catch(() => queuePendingSync({ url: '/api/events', method: 'POST', payload: body }));
    },
    [anonymousId],
  );

  const addUnique = useCallback(
    (
      key: keyof Omit<UserState, 'eventLog' | 'preferredMarkets'>,
      id: string,
      message: string,
      eventName: string,
      stateName: UserCardStateAction | 'formula_copy',
      metadata?: Record<string, unknown>,
    ) => {
      setState((current) => ({
        ...current,
        [key]: current[key].includes(id) ? current[key] : [id, ...current[key]],
      }));

      const eventPayload = { ...metadata, cardKey: id, cardId: id };
      if (stateName === 'formula_copy') {
        void syncUserFormulaState({
          cardKey: typeof metadata?.cardKey === 'string' ? metadata.cardKey : id.split('-')[0] ?? id,
          platform: typeof metadata?.platform === 'string' ? metadata.platform : 'unknown',
          action: 'copy',
          metadata,
        });
      } else {
        void syncUserCardState({
          cardKey: id,
          state: stateName,
          assetKey: typeof metadata?.assetKey === 'string' ? metadata.assetKey : undefined,
          market: typeof metadata?.market === 'string' ? metadata.market : undefined,
          source: typeof metadata?.source === 'string' ? metadata.source : eventName,
          metadata,
        });
      }
      logEvent(eventName, eventPayload);
      showToast(message);
    },
    [logEvent, showToast],
  );

  const setPreferredMarkets = useCallback(
    (markets: string[]) => {
      setState((current) => ({ ...current, preferredMarkets: markets }));
      setMixpanelSuperProperties({ preferred_markets: markets });
      registerAnonymousUser({ preferredMarkets: markets, appVersion: 'phase1-vnext' }).catch(() => undefined);
      logEvent('market_filter_change', { preferredMarkets: markets, source: 'market_preference_sheet' });
    },
    [logEvent],
  );

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      toast,
      anonymousId,
      saveCard: (id, metadata) => addUnique('savedCardIds', id, '보관함에 저장했습니다. 이후 움직임은 리포트에서 다시 확인할 수 있습니다.', 'card_save', 'saved', metadata),
      likeCard: (id, metadata) => addUnique('likedCardIds', id, '관심 카드로 표시했습니다.', 'card_like', 'liked', metadata),
      hideCard: (id, metadata) => addUnique('hiddenCardIds', id, '넘긴 카드로 기록했습니다. 다시 조건을 충족하면 리포트에서 확인됩니다.', 'card_skip', 'hidden', metadata),
      copyFormula: (id, metadata) => addUnique('copiedFormulaIds', id, '조건식이 복사되었습니다.', 'formula_copy', 'formula_copy', metadata),
      trackCard: (id, metadata) => addUnique('trackingCardIds', id, '결과 추적에 담았습니다.', 'result_track_add', 'result_tracking', metadata),
      setPreferredMarkets,
      showToast,
      logEvent,
    }),
    [addUnique, anonymousId, logEvent, setPreferredMarkets, showToast, state, toast],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
      {toast ? (
        <div className="pointer-events-none fixed left-1/2 top-5 z-50 w-[calc(100%-40px)] max-w-[390px] -translate-x-1/2 rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-bold text-white shadow-2xl">
          {toast}
        </div>
      ) : null}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return value;
}
