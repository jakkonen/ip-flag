import browser from './browser';
import type { NetworkState } from '../types';
import { getAcknowledgedChangeAt, getSettings } from './storage';

function countryFromState(state: NetworkState): string | undefined {
  if (state.status === 'mismatch') return undefined;
  if (state.ipv4 && state.ipv6 && (!state.ipv4.countryCode || !state.ipv6.countryCode)) {
    return undefined;
  }
  return state.ipv6?.countryCode ?? state.ipv4?.countryCode;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function stateTitle(state: NetworkState, headline: string): string {
  const lines = ['My IP — VPN Location', headline];
  if (state.ipv4) lines.push(`IPv4: ${state.ipv4.address}`);
  if (state.ipv6) lines.push(`IPv6: ${state.ipv6.address}`);
  lines.push(`Checked: ${formatTime(state.checkedAt)}`);
  if (state.lastChange) {
    const label = state.lastChange.type === 'country' ? 'Country changed' : 'IP changed';
    lines.push(`${label}: ${formatTime(state.lastChange.at)}`);
  }
  return lines.join('\n');
}

async function updateChangeBadge(state: NetworkState): Promise<void> {
  const acknowledgedAt = await getAcknowledgedChangeAt();
  const isNew = Boolean(state.lastChange && state.lastChange.at !== acknowledgedAt);

  await browser.action.setBadgeText({ text: isNew ? 'NEW' : '' });
  if (isNew) {
    await browser.action.setBadgeBackgroundColor({
      color: state.lastChange?.type === 'country' ? '#c2410c' : '#2563eb'
    });
  }
}

export async function updateAction(state: NetworkState): Promise<void> {
  await updateChangeBadge(state);

  if (state.status === 'offline') {
    await browser.action.setIcon({
      path: {
        16: 'icons/warning-16.png',
        32: 'icons/warning-32.png'
      }
    });
    await browser.action.setTitle({ title: stateTitle(state, 'Public IP unavailable') });
    return;
  }

  if (state.status === 'mismatch') {
    await browser.action.setIcon({
      path: {
        16: 'icons/warning-16.png',
        32: 'icons/warning-32.png'
      }
    });
    await browser.action.setTitle({ title: stateTitle(state, 'IPv4 / IPv6 country mismatch') });
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
    await browser.action.setTitle({ title: stateTitle(state, 'Country unavailable') });
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

  const countryName = state.ipv6?.countryName ?? state.ipv4?.countryName ?? countryCode;
  await browser.action.setTitle({ title: stateTitle(state, `${countryName} · ${countryCode}`) });
}
