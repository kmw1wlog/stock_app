export type DataMode = 'live' | 'mock';

export function getDataMode(): DataMode {
  if (process.env.DATA_MODE === 'mock') return 'mock';
  if (process.env.NEXT_PUBLIC_ALLOW_MOCK_DATA === 'true') return 'mock';
  return 'live';
}

export function isMockAllowed() {
  return getDataMode() === 'mock';
}

export function getMissingEnv(keys: string[]) {
  return keys.filter((key) => !process.env[key]);
}

export function emptyDataMessage(missing: string[] = []) {
  return missing.length ? 'API 키 필요' : '데이터 준비중';
}
