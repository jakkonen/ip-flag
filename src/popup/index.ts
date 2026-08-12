import browser from '../lib/browser';
import './popup.css';
import type { CheckHistoryEntry, FlagStyle, IpState, NetworkState, RuntimeMessage, UserSettings } from '../types';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const statusEl = $('status');
const warningEl = $('warning');
const changeNoticeEl = $('change-notice');
const checkedEl = $('checked');
const refreshButton = $<HTMLButtonElement>('refresh');
const flagStyle = $<HTMLSelectElement>('flag-style');
const refreshOnStartup = $<HTMLInputElement>('refresh-on-startup');
const refreshOnPopupOpen = $<HTMLInputElement>('refresh-on-popup-open');
const refreshOnNewTab = $<HTMLInputElement>('refresh-on-new-tab');
const scheduledRefreshEnabled = $<HTMLInputElement>('scheduled-refresh-enabled');
const refreshInterval = $<HTMLSelectElement>('refresh-interval');
const refreshIntervalControl = $('refresh-interval-control');
const notifyIpChange = $<HTMLInputElement>('notify-ip-change');
const notifyCountryChange = $<HTMLInputElement>('notify-country-change');
const testNotificationButton = $<HTMLButtonElement>('test-notification');
const historyEl = $('history');
const clearHistoryButton = $<HTMLButtonElement>('clear-history');
const clearGeoCacheButton = $<HTMLButtonElement>('clear-geo-cache');

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

let currentSettings: UserSettings = { ...DEFAULT_SETTINGS };

function flagUrl(countryCode: string, style: FlagStyle): string {
  return browser.runtime.getURL(`flags/${style}/32/${countryCode.toLowerCase()}.png`);
}

function formatNetwork(ip?: IpState): string {
  if (!ip) return '';
  const parts = [ip.asn ? `AS${ip.asn}` : undefined, ip.organization].filter(Boolean);
  return parts.join(' · ');
}

function formatLocation(ip?: Pick<IpState, 'countryName'>): string {
  if (!ip?.countryName) return 'Country unavailable';
  return ip.countryName;
}

function networkDetails(ip?: IpState): string[] {
  if (!ip) return [];
  const details: string[] = [];
  if (ip.networkType && ip.networkType !== 'isp') details.push(ip.networkType);
  if (ip.isDatacenter) details.push('Data center');
  if (ip.isVpn) details.push('VPN detected');
  if (ip.isProxy) details.push('Proxy detected');
  if (ip.isTor) details.push('Tor detected');
  return details;
}

function renderIp(prefix: 'ipv4' | 'ipv6', ip: IpState | undefined, style: FlagStyle): void {
  const flag = $<HTMLImageElement>(`${prefix}-flag`);
  const card = $(`${prefix}-card`);
  const country = $(`${prefix}-country`);
  const address = $(`${prefix}-address`);
  const copyButton = $<HTMLButtonElement>(`${prefix}-copy`);
  const network = $(`${prefix}-network`);
  const networkDetailsEl = $(`${prefix}-network-details`);

  if (!ip) {
    card.classList.add('ip-card--unavailable');
    flag.classList.add('hidden');
    country.textContent = 'Not available';
    address.textContent = '—';
    address.dataset.value = '';
    copyButton.disabled = true;
    copyButton.hidden = true;
    network.textContent = '';
    networkDetailsEl.replaceChildren();
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
  country.textContent = formatLocation(ip);
  address.textContent = ip.address;
  address.dataset.value = ip.address;
  copyButton.disabled = false;
  copyButton.hidden = false;
  network.textContent = formatNetwork(ip);
  networkDetailsEl.replaceChildren(...networkDetails(ip).map((detail) => {
    const badge = document.createElement('span');
    badge.className = `network-detail${detail.includes('detected') ? ' network-detail--warning' : ''}`;
    badge.textContent = detail;
    return badge;
  }));
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
  if (state.lastChange) {
    const label = state.lastChange.type === 'country' ? 'Exit country changed' : 'Public IP changed';
    changeNoticeEl.textContent = `${label} at ${new Date(state.lastChange.at).toLocaleTimeString([], {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })}`;
    changeNoticeEl.dataset.change = state.lastChange.type;
    changeNoticeEl.classList.remove('hidden');
  } else {
    changeNoticeEl.classList.add('hidden');
  }
  renderIp('ipv4', state.ipv4, style);
  renderIp('ipv6', state.ipv6, style);
  checkedEl.textContent = `Checked ${new Date(state.checkedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
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

function settingsFromForm(): UserSettings {
  return {
    flagStyle: flagStyle.value as FlagStyle,
    refreshOnStartup: refreshOnStartup.checked,
    refreshOnPopupOpen: refreshOnPopupOpen.checked,
    refreshOnNewTab: refreshOnNewTab.checked,
    scheduledRefreshEnabled: scheduledRefreshEnabled.checked,
    refreshIntervalMinutes: Number(refreshInterval.value) as UserSettings['refreshIntervalMinutes'],
    notifyIpChange: notifyIpChange.checked,
    notifyCountryChange: notifyCountryChange.checked
  };
}

function renderSettings(settings: UserSettings): void {
  currentSettings = settings;
  flagStyle.value = settings.flagStyle;
  refreshOnStartup.checked = settings.refreshOnStartup;
  refreshOnPopupOpen.checked = settings.refreshOnPopupOpen;
  refreshOnNewTab.checked = settings.refreshOnNewTab;
  scheduledRefreshEnabled.checked = settings.scheduledRefreshEnabled;
  refreshInterval.value = String(settings.refreshIntervalMinutes);
  notifyIpChange.checked = settings.notifyIpChange;
  notifyCountryChange.checked = settings.notifyCountryChange;
  refreshInterval.disabled = !settings.scheduledRefreshEnabled;
  refreshIntervalControl.classList.toggle('is-disabled', !settings.scheduledRefreshEnabled);
}

function describeHistory(entry: CheckHistoryEntry): string {
  const changes: string[] = [];
  if (entry.changes.ipv4Address) changes.push('IPv4 changed');
  if (entry.changes.ipv6Address) changes.push('IPv6 changed');
  if (entry.changes.ipv4Country) changes.push('IPv4 country changed');
  if (entry.changes.ipv6Country) changes.push('IPv6 country changed');
  if (changes.length) return changes.join(' · ');

  const addresses = [entry.ipv4?.address, entry.ipv6?.address].filter(Boolean).join(' · ');
  return addresses || 'Public IP unavailable';
}

function triggerLabel(trigger: CheckHistoryEntry['trigger']): string {
  switch (trigger) {
    case 'startup': return 'Browser start';
    case 'popup': return 'Popup opened';
    case 'manual': return 'Manual refresh';
    case 'alarm': return 'Scheduled';
    case 'newTab': return 'New tab';
  }
}

function historyCountries(entry: CheckHistoryEntry): Array<{ countryCode: string; countryName?: string; geoSource?: 'cache' | 'request' }> {
  const countries = [entry.ipv4, entry.ipv6]
    .flatMap((ip) => ip?.countryCode
      ? [{ countryCode: ip.countryCode, countryName: ip.countryName, geoSource: ip.geoSource }]
      : []);

  return countries.filter((country, index) =>
    countries.findIndex((candidate) => candidate.countryCode === country.countryCode) === index
  );
}

function renderHistory(history: CheckHistoryEntry[]): void {
  historyEl.replaceChildren();
  clearHistoryButton.hidden = history.length === 0;

  if (!history.length) {
    historyEl.className = 'history-empty';
    historyEl.textContent = 'No completed checks yet.';
    return;
  }

  historyEl.className = 'history-list';
  for (const entry of history.slice(0, 10)) {
    const row = document.createElement('div');
    row.className = 'history-entry';
    const header = document.createElement('div');
    header.className = 'history-entry__header';
    const time = document.createElement('span');
    time.className = 'history-entry__time';
    time.textContent = new Date(entry.checkedAt).toLocaleString([], {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    const trigger = document.createElement('span');
    trigger.className = 'history-entry__trigger';
    trigger.textContent = triggerLabel(entry.trigger ?? 'manual');
    const detail = document.createElement('div');
    detail.className = 'history-entry__address';
    detail.textContent = describeHistory(entry);
    const countries = document.createElement('div');
    countries.className = 'history-entry__countries';
    for (const country of historyCountries(entry)) {
      const flag = document.createElement('img');
      flag.className = 'history-entry__flag';
      flag.src = flagUrl(country.countryCode, currentSettings.flagStyle);
      flag.alt = country.countryCode;
      const label = document.createElement('span');
      label.textContent = formatLocation(country);
      const source = document.createElement('span');
      source.className = 'history-entry__source';
      source.textContent = country.geoSource === 'request' ? 'GeoIP request' : 'GeoIP cache';
      countries.append(flag, label, source);
    }
    header.append(time, trigger, detail);
    row.append(header, countries);
    if (Object.values(entry.changes).some(Boolean)) {
      detail.classList.add('history-entry__change');
    }
    historyEl.append(row);
  }
}

async function saveSettings(): Promise<void> {
  const settings = settingsFromForm();
  await send({ type: 'SET_SETTINGS', settings });
  renderSettings(settings);
}

async function load(): Promise<void> {
  try {
    const saved = await browser.storage.local.get('settings');
    renderSettings({ ...DEFAULT_SETTINGS, ...((saved.settings as Partial<UserSettings> | undefined) ?? {}) });
    const state = await send<NetworkState>({ type: 'OPEN_POPUP' });
    const history = await send<CheckHistoryEntry[]>({ type: 'GET_HISTORY' });
    render(state);
    renderHistory(history);
    await send({ type: 'ACKNOWLEDGE_CHANGE' });
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
    renderHistory(await send<CheckHistoryEntry[]>({ type: 'GET_HISTORY' }));
  } catch {
    showError();
  } finally {
    refreshButton.disabled = false;
  }
});

for (const control of [flagStyle, refreshOnStartup, refreshOnPopupOpen, refreshOnNewTab, scheduledRefreshEnabled, refreshInterval, notifyIpChange, notifyCountryChange]) {
  control.addEventListener('change', async () => {
  try {
      await saveSettings();
      const state = await send<NetworkState>({ type: 'GET_STATE' });
      render(state);
  } catch {
    showError();
  }
  });
}

clearHistoryButton.addEventListener('click', async () => {
  await send({ type: 'CLEAR_HISTORY' });
  renderHistory([]);
});

clearGeoCacheButton.addEventListener('click', async () => {
  clearGeoCacheButton.disabled = true;
  try {
    await send({ type: 'CLEAR_GEO_CACHE' });
    const state = await send<NetworkState>({ type: 'REFRESH', force: true });
    render(state);
    renderHistory(await send<CheckHistoryEntry[]>({ type: 'GET_HISTORY' }));
    clearGeoCacheButton.textContent = 'Location cache cleared';
  } catch {
    clearGeoCacheButton.textContent = 'Could not clear cache';
  } finally {
    setTimeout(() => {
      clearGeoCacheButton.textContent = 'Clear location cache';
      clearGeoCacheButton.disabled = false;
    }, 1_500);
  }
});

testNotificationButton.addEventListener('click', async () => {
  testNotificationButton.disabled = true;
  try {
    await send({ type: 'TEST_NOTIFICATION' });
    testNotificationButton.textContent = 'Sent';
  } catch {
    testNotificationButton.textContent = 'Failed';
  } finally {
    setTimeout(() => {
      testNotificationButton.textContent = 'Test notification';
      testNotificationButton.disabled = false;
    }, 1_500);
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
