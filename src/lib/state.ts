import { CONFIG } from '../config';
import type { IpFamily, IpState, NetworkState } from '../types';
import { getGeoInfo } from './geo';
import { updateAction } from './icon';
import { getPublicIp } from './network';
import { calculateStatus } from './status';
import { getCurrentState, setCurrentState } from './storage';

let inFlight: Promise<NetworkState> | undefined;

async function resolveIpState(family: IpFamily): Promise<IpState | undefined> {
  const address = await getPublicIp(family);
  if (!address) return undefined;

  try {
    const geo = await getGeoInfo(address);
    return { family, address, ...geo };
  } catch {
    return { family, address, checkedAt: Date.now() };
  }
}

async function refreshInternal(force = false): Promise<NetworkState> {
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
  await updateAction(state);
  return state;
}

export async function refreshNetworkState(force = false): Promise<NetworkState> {
  if (!inFlight) {
    inFlight = refreshInternal(force).finally(() => {
      inFlight = undefined;
    });
  }

  return inFlight;
}
