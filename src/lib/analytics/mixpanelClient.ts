'use client';

import mixpanel from 'mixpanel-browser';

let initialized = false;

export function initMixpanel() {
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (!token || initialized) {
    return false;
  }

  mixpanel.init(token, {
    debug: process.env.NEXT_PUBLIC_MIXPANEL_DEBUG === 'true',
    persistence: 'localStorage',
  });
  initialized = true;
  return true;
}

export function setMixpanelSuperProperties(properties: Record<string, unknown>) {
  if (!initMixpanel()) {
    return;
  }
  mixpanel.register(properties);
}

export function trackMixpanelEvent(eventName: string, properties: Record<string, unknown> = {}) {
  if (!initMixpanel()) {
    return;
  }
  mixpanel.track(eventName, properties);
}

export function identifyMixpanelUser(userId: string) {
  if (!initMixpanel()) {
    return;
  }
  mixpanel.identify(userId);
}
