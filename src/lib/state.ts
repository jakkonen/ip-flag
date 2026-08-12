import { CONFIG } from '../config';
import type { CheckHistoryEntry, CheckTrigger, IpFamily, IpState, NetworkState } from '../types';
import browser from './browser';
import { getGeoInfo } from './geo';
import { updateAction } from './icon';
import { getPublicIp } from './network';
import { calculateStatus } from './status';
import { addCheckHistory, getCurrentState, getSettings, setCurrentState } from './storage';

let inFlight: Promise<NetworkState> | undefined;

function hasChanged(previous: string | undefined, next: string | undefined): boolean {
  return Boolean(previous && next && previous !== next);
}

function toHistoryEntry(previous: NetworkState | undefined, state: NetworkState, trigger: CheckTrigger): CheckHistoryEntry {
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
      ipv4Address: hasChanged(previous?.ipv4?.address, state.ipv4?.address),
      ipv6Address: hasChanged(previous?.ipv6?.address, state.ipv6?.address),
      ipv4Country: hasChanged(previous?.ipv4?.countryCode, state.ipv4?.countryCode),
      ipv6Country: hasChanged(previous?.ipv6?.countryCode, state.ipv6?.countryCode)
    }
  };
}

async function notifyChanges(entry: CheckHistoryEntry): Promise<void> {
  const settings = await getSettings();
  const changedIp = entry.changes.ipv4Address || entry.changes.ipv6Address;
  const changedCountry = entry.changes.ipv4Country || entry.changes.ipv6Country;

  if (!(settings.notifyIpChange && changedIp) && !(settings.notifyCountryChange && changedCountry)) return;

  const parts: string[] = [];
  if (settings.notifyIpChange && changedIp) parts.push('Public IP changed');
  if (settings.notifyCountryChange && changedCountry) parts.push('Exit country changed');

  try {
    await browser.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon-128.png',
      title: 'My IP — VPN Location',
      message: parts.join(' · ')
    });
  } catch {
    // Уведомление не должно отменять успешно завершённую проверку IP.
  }
}

async function resolveIpState(family: IpFamily): Promise<IpState | undefined> {
  const address = await getPublicIp(family);
  if (!address) return undefined;

  try {
    const geo = await getGeoInfo(address);
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

  const [ipv4, ipv6] = await Promise.all([resolveIpState('ipv4'), resolveIpState('ipv6')]);

  const state: NetworkState = {
    ipv4,
    ipv6,
    checkedAt: Date.now(),
    status: calculateStatus(ipv4, ipv6)
  };

  await setCurrentState(state);
  const entry = toHistoryEntry(cached, state, trigger);
  await addCheckHistory(entry);
  await notifyChanges(entry);
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
