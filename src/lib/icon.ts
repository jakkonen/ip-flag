import browser from './browser';
import type { NetworkState } from '../types';
import { getSettings } from './storage';

function countryFromState(state: NetworkState): string | undefined {
  if (state.status === 'mismatch') return undefined;
  if (state.ipv4 && state.ipv6 && (!state.ipv4.countryCode || !state.ipv6.countryCode)) {
    return undefined;
  }
  return state.ipv6?.countryCode ?? state.ipv4?.countryCode;
}

export async function updateAction(state: NetworkState): Promise<void> {
  if (state.status === 'mismatch') {
    await browser.action.setIcon({
      path: {
        16: 'icons/warning-16.png',
        32: 'icons/warning-32.png'
      }
    });
    await browser.action.setTitle({ title: 'IP Flag: IPv4 / IPv6 country mismatch' });
    return;
  }

  const countryCode = countryFromState(state);
  if (!countryCode) {
    await browser.action.setIcon({
      path: {
        16: 'icons/icon-16.png',
        32: 'icons/icon-32.png'
      }
    });
    const title = state.status === 'offline' ? 'public IP unavailable' : 'country unavailable';
    await browser.action.setTitle({ title: `IP Flag: ${title}` });
    return;
  }

  const settings = await getSettings();
  const cc = countryCode.toLowerCase();

  try {
    await browser.action.setIcon({
      path: {
        16: `flags/${settings.flagStyle}/16/${cc}.png`,
        32: `flags/${settings.flagStyle}/32/${cc}.png`
      }
    });
  } catch {
    await browser.action.setIcon({
      path: {
        16: 'icons/icon-16.png',
        32: 'icons/icon-32.png'
      }
    });
  }

  const label = state.ipv6 && state.ipv4 ? 'IPv4 + IPv6' : state.ipv6 ? 'IPv6' : 'IPv4';
  const countryName = state.ipv6?.countryName ?? state.ipv4?.countryName ?? countryCode;
  await browser.action.setTitle({ title: `IP Flag: ${countryName} · ${label}` });
}
