import { CONFIG } from '../config';
import type { CheckHistoryEntry, CheckTrigger, IpFamily, IpState, NetworkState } from '../types';
import browser from './browser';
import { getGeoInfo } from './geo';
import { updateAction } from './icon';
import { getPublicIp } from './network';
import { calculateStatus } from './status';
import { addCheckHistory, getCheckHistory, getCurrentState, getSettings, setCurrentState } from './storage';

let inFlight: Promise<NetworkState> | undefined;

function hasChanged(previous: string | undefined, next: string | undefined): boolean {
  return Boolean(previous && next && previous !== next);
}

function lastKnownState(
  previous: NetworkState | undefined,
  history: CheckHistoryEntry[],
  family: IpFamily
): Pick<IpState, 'address' | 'countryCode'> | undefined {
  if (previous?.[family]) return previous[family];
  return history.find((entry) => entry[family])?.[family];
}

function toHistoryEntry(
  previous: NetworkState | undefined,
  history: CheckHistoryEntry[],
  state: NetworkState,
  trigger: CheckTrigger
): CheckHistoryEntry {
  const previousIpv4 = lastKnownState(previous, history, 'ipv4');
  const previousIpv6 = lastKnownState(previous, history, 'ipv6');
  return {
    checkedAt: state.checkedAt,
    trigger,
    status: state.status,
    ipv4: state.ipv4 && {
      address: state.ipv4.address,
      countryCode: state.ipv4.countryCode,
      countryName: state.ipv4.countryName,
      geoSource: state.ipv4.geoSource
    },
    ipv6: state.ipv6 && {
      address: state.ipv6.address,
      countryCode: state.ipv6.countryCode,
      countryName: state.ipv6.countryName,
      geoSource: state.ipv6.geoSource
    },
    changes: {
      ipv4Address: hasChanged(previousIpv4?.address, state.ipv4?.address),
      ipv6Address: hasChanged(previousIpv6?.address, state.ipv6?.address),
      ipv4Country: hasChanged(previousIpv4?.countryCode, state.ipv4?.countryCode),
      ipv6Country: hasChanged(previousIpv6?.countryCode, state.ipv6?.countryCode)
    }
  };
}

function changeFromEntry(entry: CheckHistoryEntry): NetworkState['lastChange'] | undefined {
  if (entry.changes.ipv4Country || entry.changes.ipv6Country) {
    return { at: entry.checkedAt, type: 'country' };
  }
  if (entry.changes.ipv4Address || entry.changes.ipv6Address) {
    return { at: entry.checkedAt, type: 'ip' };
  }
  return undefined;
}

async function createNotification(title: string, message: string, countryCode?: string): Promise<void> {
  const iconPath = countryCode
    ? `flags/round/32/${countryCode.toLowerCase()}.png`
    : 'icons/icon-128.png';

  await browser.notifications.create(`network-change-${Date.now()}`, {
    type: 'basic',
    iconUrl: browser.runtime.getURL(iconPath),
    title,
    message
  });
}

export async function showTestNotification(): Promise<void> {
  await createNotification('My IP — VPN Location', 'Notifications are working.');
}

async function notifyChanges(entry: CheckHistoryEntry): Promise<void> {
  const settings = await getSettings();
  const changedIp = entry.changes.ipv4Address || entry.changes.ipv6Address;
  const changedCountry = entry.changes.ipv4Country || entry.changes.ipv6Country;

  if (!(settings.notifyIpChange && changedIp) && !(settings.notifyCountryChange && changedCountry)) return;

  const parts: string[] = [];
  if (settings.notifyIpChange && changedIp) parts.push('Public IP changed');
  if (settings.notifyCountryChange && changedCountry) parts.push('Exit country changed');

  const changedCountryCode = entry.changes.ipv4Country
    ? entry.ipv4?.countryCode
    : entry.changes.ipv6Country
      ? entry.ipv6?.countryCode
      : entry.ipv4?.countryCode ?? entry.ipv6?.countryCode;
  const countryName = entry.ipv4?.countryName ?? entry.ipv6?.countryName;
  const address = entry.ipv4?.address ?? entry.ipv6?.address;
  const detail = [address, countryName].filter(Boolean).join(' · ');

  try {
    await createNotification('My IP — VPN Location', [parts.join(' · '), detail].filter(Boolean).join('\n'), changedCountryCode);
  } catch {
    // Уведомление не должно отменять успешно завершённую проверку IP.
  }
}

async function resolveIpState(family: IpFamily, lookupCity: boolean): Promise<IpState | undefined> {
  const address = await getPublicIp(family);
  if (!address) return undefined;

  try {
    const geo = await getGeoInfo(address, false, lookupCity);
    return { family, address, ...geo.info, geoSource: geo.source };
  } catch {
    return { family, address, checkedAt: Date.now() };
  }
}

async function refreshInternal(force: boolean, trigger: CheckTrigger): Promise<NetworkState> {
  const cached = await getCurrentState();

  if (!force && cached && Date.now() - cached.checkedAt < CONFIG.refresh.currentStateTtlMs) {
    return cached;
  }

  const settings = await getSettings();
  const [ipv4, ipv6] = await Promise.all([
    resolveIpState('ipv4', settings.lookupCity),
    resolveIpState('ipv6', settings.lookupCity)
  ]);

  const state: NetworkState = {
    ipv4,
    ipv6,
    checkedAt: Date.now(),
    status: calculateStatus(ipv4, ipv6),
    lastChange: cached?.lastChange
  };

  if (state.status !== 'offline') {
    const history = await getCheckHistory();
    const entry = toHistoryEntry(cached, history, state, trigger);
    state.lastChange = changeFromEntry(entry) ?? state.lastChange;
    await addCheckHistory(entry);
    await notifyChanges(entry);
  }
  await setCurrentState(state);
  await updateAction(state);
  return state;
}

export async function refreshNetworkState(force = false, trigger: CheckTrigger = 'manual'): Promise<NetworkState> {
  if (!inFlight) {
    inFlight = refreshInternal(force, trigger).finally(() => {
      inFlight = undefined;
    });
  }

  return inFlight;
}
