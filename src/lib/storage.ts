import browser from './browser';
import type { CachedGeoInfo, NetworkState, UserSettings } from '../types';

const KEYS = {
  currentState: 'currentState',
  geoCache: 'geoCache',
  settings: 'settings'
} as const;

const DEFAULT_SETTINGS: UserSettings = {
  flagStyle: 'round'
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
