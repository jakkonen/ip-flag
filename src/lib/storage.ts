import browser from './browser';
import type { CachedGeoInfo, CheckHistoryEntry, NetworkState, UserSettings } from '../types';

const KEYS = {
  currentState: 'currentState',
  geoCache: 'geoCache',
  settings: 'settings',
  checkHistory: 'checkHistory'
} as const;

const MAX_HISTORY_ENTRIES = 200;

const DEFAULT_SETTINGS: UserSettings = {
  flagStyle: 'round',
  refreshOnStartup: true,
  refreshOnPopupOpen: true,
  refreshOnNewTab: false,
  scheduledRefreshEnabled: true,
  refreshIntervalMinutes: 5,
  notifyIpChange: false,
  notifyCountryChange: false
};

export async function getCurrentState(): Promise<NetworkState | undefined> {
  const result = await browser.storage.local.get(KEYS.currentState);
  return result[KEYS.currentState] as NetworkState | undefined;
}

export async function setCurrentState(state: NetworkState): Promise<void> {
  await browser.storage.local.set({ [KEYS.currentState]: state });
}

export async function getGeoCache(): Promise<Record<string, CachedGeoInfo>> {
  const result = await browser.storage.local.get(KEYS.geoCache);
  return (result[KEYS.geoCache] as Record<string, CachedGeoInfo> | undefined) ?? {};
}

export async function setGeoCache(cache: Record<string, CachedGeoInfo>): Promise<void> {
  await browser.storage.local.set({ [KEYS.geoCache]: cache });
}

export async function getSettings(): Promise<UserSettings> {
  const result = await browser.storage.local.get(KEYS.settings);
  return {
    ...DEFAULT_SETTINGS,
    ...((result[KEYS.settings] as Partial<UserSettings> | undefined) ?? {})
  };
}

export async function setSettings(settings: UserSettings): Promise<void> {
  await browser.storage.local.set({ [KEYS.settings]: settings });
}

export async function getCheckHistory(): Promise<CheckHistoryEntry[]> {
  const result = await browser.storage.local.get(KEYS.checkHistory);
  return (result[KEYS.checkHistory] as CheckHistoryEntry[] | undefined) ?? [];
}

export async function addCheckHistory(entry: CheckHistoryEntry): Promise<void> {
  const history = await getCheckHistory();
  history.unshift(entry);
  await browser.storage.local.set({ [KEYS.checkHistory]: history.slice(0, MAX_HISTORY_ENTRIES) });
}

export async function clearCheckHistory(): Promise<void> {
  await browser.storage.local.remove(KEYS.checkHistory);
}
