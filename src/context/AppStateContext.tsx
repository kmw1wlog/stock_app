'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type UserState = {
  savedCardIds: string[];
  likedCardIds: string[];
  hiddenCardIds: string[];
  copiedFormulaIds: string[];
  trackingCardIds: string[];
  eventLog: Array<{
    eventName: string;
    payload?: Record<string, unknown>;
    createdAt: string;
  }>;
};

type AppStateContextValue = {
  state: UserState;
  toast: string | null;
  saveCard: (id: string) => void;
  likeCard: (id: string) => void;
  hideCard: (id: string) => void;
  copyFormula: (id: string) => void;
  trackCard: (id: string) => void;
  showToast: (message: string) => void;
  logEvent: (eventName: string, payload?: Record<string, unknown>) => void;
};

const defaultState: UserState = {
  savedCardIds: ['rainbow-robotics', 'isupetasys', 'alteogen'],
  likedCardIds: ['isupetasys'],
  hiddenCardIds: [],
  copiedFormulaIds: ['rainbow-robotics-yesTrader'],
  trackingCardIds: ['rainbow-robotics', 'isupetasys', 'alteogen'],
  eventLog: [],
};

const AppStateContext = createContext<AppStateContextValue | null>(null);
const storageKey = 'surge-for-you-state';
const anonUserKey = 'surge-for-you-anon-id';

function getAnonUserId() {
  const existing = window.localStorage.getItem(anonUserKey);
  if (existing) {
    return existing;
  }
  const anonUserId = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  window.localStorage.setItem(anonUserKey, anonUserId);
  return anonUserId;
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UserState>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      setState({ ...defaultState, ...JSON.parse(raw) });
    }
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

  const logEvent = useCallback((eventName: string, payload?: Record<string, unknown>) => {
    const entry = { eventName, payload, createdAt: new Date().toISOString() };
    console.log('[event]', eventName, payload);
    setState((current) => ({
      ...current,
      eventLog: [entry, ...(current.eventLog ?? [])].slice(0, 200),
    }));
    const anonUserId = getAnonUserId();
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anonUserId,
        eventType: eventName,
        cardId: typeof payload?.cardId === 'string' ? payload.cardId : undefined,
        assetId: typeof payload?.assetId === 'string' ? payload.assetId : undefined,
        market: typeof payload?.market === 'string' ? payload.market : undefined,
        metadata: payload,
      }),
    }).catch(() => undefined);
  }, []);

  const addUnique = useCallback((key: keyof Omit<UserState, 'eventLog'>, id: string, message: string, eventName: string) => {
    setState((current) => ({
      ...current,
      [key]: current[key].includes(id) ? current[key] : [id, ...current[key]],
    }));
    logEvent(eventName, { cardId: id });
    showToast(message);
  }, [logEvent, showToast]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      toast,
      saveCard: (id) => addUnique('savedCardIds', id, '저장 완료. 이 카드가 이후 어떻게 움직이는지 결과에서 확인할 수 있어요.', 'card_save'),
      likeCard: (id) => addUnique('likedCardIds', id, '관심 카드로 저장했어요. 비슷한 사용자들이 함께 본 종목을 더 보여드릴게요.', 'card_like'),
      hideCard: (id) => addUnique('hiddenCardIds', id, '넘긴 카드로 기록했어요. 나중에 다시 반응하면 알려드릴게요.', 'card_skip'),
      copyFormula: (id) => addUnique('copiedFormulaIds', id, '조건식이 복사되었습니다.', 'formula_copy'),
      trackCard: (id) => addUnique('trackingCardIds', id, '결과 추적에 추가했습니다.', 'result_track_add'),
      showToast,
      logEvent,
    }),
    [addUnique, logEvent, showToast, state, toast],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
      {toast ? (
        <div className="fixed left-1/2 top-5 z-50 w-[calc(100%-40px)] max-w-[390px] -translate-x-1/2 rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-bold text-white shadow-2xl">
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
