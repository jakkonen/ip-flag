import browser from '../lib/browser';
import './popup.css';
import type { FlagStyle, IpState, NetworkState, RuntimeMessage } from '../types';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const statusEl = $('status');
const warningEl = $('warning');
const checkedEl = $('checked');
const refreshButton = $<HTMLButtonElement>('refresh');
const flagStyle = $<HTMLSelectElement>('flag-style');

function flagUrl(countryCode: string, style: FlagStyle): string {
  return browser.runtime.getURL(`flags/${style}/32/${countryCode.toLowerCase()}.png`);
}

function formatNetwork(ip?: IpState): string {
  if (!ip) return '';
  const parts = [ip.asn ? `AS${ip.asn}` : undefined, ip.organization].filter(Boolean);
  return parts.join(' · ');
}

function renderIp(prefix: 'ipv4' | 'ipv6', ip: IpState | undefined, style: FlagStyle): void {
  const flag = $<HTMLImageElement>(`${prefix}-flag`);
  const card = $(`${prefix}-card`);
  const country = $(`${prefix}-country`);
  const address = $(`${prefix}-address`);
  const copyButton = $<HTMLButtonElement>(`${prefix}-copy`);
  const network = $(`${prefix}-network`);

  if (!ip) {
    card.classList.add('ip-card--unavailable');
    flag.classList.add('hidden');
    country.textContent = 'Not available';
    address.textContent = '—';
    address.dataset.value = '';
    copyButton.disabled = true;
    copyButton.hidden = true;
    network.textContent = '';
    return;
  }

  card.classList.remove('ip-card--unavailable');

  if (ip.countryCode) {
    flag.src = flagUrl(ip.countryCode, style);
    flag.alt = ip.countryCode;
    flag.classList.remove('hidden');
  } else {
    flag.classList.add('hidden');
  }
  country.textContent = ip.countryName && ip.countryCode
    ? `${ip.countryName} · ${ip.countryCode}`
    : 'Country unavailable';
  address.textContent = ip.address;
  address.dataset.value = ip.address;
  copyButton.disabled = false;
  copyButton.hidden = false;
  network.textContent = formatNetwork(ip);
}

function statusText(state: NetworkState): string {
  switch (state.status) {
    case 'ok':
      return 'IPv4 and IPv6 agree';
    case 'mismatch':
      return 'Country mismatch';
    case 'partial':
      if (state.ipv4 && state.ipv6) return 'Country data incomplete';
      return state.ipv6 ? 'IPv6 only' : 'IPv4 only';
    case 'offline':
      return 'Public IP unavailable';
  }
}

function render(state: NetworkState): void {
  const style = flagStyle.value as FlagStyle;
  statusEl.textContent = statusText(state);
  statusEl.dataset.status = state.status;
  warningEl.classList.toggle('hidden', state.status !== 'mismatch');
  renderIp('ipv4', state.ipv4, style);
  renderIp('ipv6', state.ipv6, style);
  checkedEl.textContent = `Checked ${new Date(state.checkedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })}`;
}

function showError(): void {
  statusEl.textContent = 'Check failed';
  warningEl.classList.add('hidden');
  checkedEl.textContent = 'Try refreshing';
}

async function send<T>(message: RuntimeMessage): Promise<T> {
  return (await browser.runtime.sendMessage(message)) as T;
}

async function load(): Promise<void> {
  const settings = await browser.storage.local.get('settings');
  const savedStyle = (settings.settings as { flagStyle?: FlagStyle } | undefined)?.flagStyle;
  if (savedStyle) flagStyle.value = savedStyle;

  try {
    const state = await send<NetworkState>({ type: 'GET_STATE' });
    render(state);
  } catch {
    showError();
  }
}

refreshButton.addEventListener('click', async () => {
  refreshButton.disabled = true;
  statusEl.textContent = 'Checking…';

  try {
    const state = await send<NetworkState>({ type: 'REFRESH', force: true });
    render(state);
  } catch {
    showError();
  } finally {
    refreshButton.disabled = false;
  }
});

flagStyle.addEventListener('change', async () => {
  const style = flagStyle.value as FlagStyle;
  try {
    await send({ type: 'SET_FLAG_STYLE', style });
    const state = await send<NetworkState>({ type: 'GET_STATE' });
    render(state);
  } catch {
    showError();
  }
});

for (const prefix of ['ipv4', 'ipv6'] as const) {
  $<HTMLButtonElement>(`${prefix}-copy`).addEventListener('click', async (event) => {
    const copyButton = event.currentTarget as HTMLButtonElement;
    const value = $(`${prefix}-address`).dataset.value;
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      copyButton.textContent = 'Copied';
      setTimeout(() => {
        copyButton.textContent = 'Copy';
      }, 1_500);
    } catch {
      copyButton.textContent = 'Failed';
      setTimeout(() => {
        copyButton.textContent = 'Copy';
      }, 1_500);
    }
  });
}

void load();
