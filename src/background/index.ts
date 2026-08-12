import browser from '../lib/browser';
import { CONFIG } from '../config';
import type { RuntimeMessage } from '../types';
import { updateAction } from '../lib/icon';
import { refreshNetworkState } from '../lib/state';
import { clearCheckHistory, getCheckHistory, getCurrentState, getSettings, setSettings } from '../lib/storage';

const ALARM_NAME = 'refresh-public-ip';

async function configureAlarm(): Promise<void> {
  const settings = await getSettings();
  const alarm = await browser.alarms.get(ALARM_NAME);

  if (!settings.scheduledRefreshEnabled) {
    if (alarm) await browser.alarms.clear(ALARM_NAME);
    return;
  }

  if (alarm?.periodInMinutes === settings.refreshIntervalMinutes) return;
  if (alarm) await browser.alarms.clear(ALARM_NAME);
  await browser.alarms.create(ALARM_NAME, {
    periodInMinutes: settings.refreshIntervalMinutes ?? CONFIG.refresh.alarmMinutes
  });
}

browser.runtime.onInstalled.addListener(() => {
  void configureAlarm();
  void refreshNetworkState(true, 'startup');
});

browser.runtime.onStartup.addListener(() => {
  void configureAlarm();
  void getSettings().then((settings) => {
    if (settings.refreshOnStartup) void refreshNetworkState(true, 'startup');
  });
});

browser.alarms.onAlarm.addListener((alarm: { name: string }) => {
  if (alarm.name === ALARM_NAME) {
    void getSettings().then((settings) => {
      if (settings.scheduledRefreshEnabled) void refreshNetworkState(true, 'alarm');
    });
  }
});

browser.tabs.onCreated.addListener(() => {
  void getSettings().then((settings) => {
    if (settings.refreshOnNewTab) void refreshNetworkState(true, 'newTab');
  });
});

browser.runtime.onMessage.addListener(async (message: RuntimeMessage) => {
  switch (message.type) {
    case 'GET_STATE':
      return refreshNetworkState(false);

    case 'OPEN_POPUP': {
      const [settings, current] = await Promise.all([getSettings(), getCurrentState()]);
      if (!current || settings.refreshOnPopupOpen) {
        return refreshNetworkState(true, 'popup');
      }
      return current;
    }

    case 'REFRESH':
      return refreshNetworkState(message.force ?? true, 'manual');

    case 'SET_SETTINGS': {
      await setSettings(message.settings);
      await configureAlarm();
      const state = await getCurrentState();
      if (state) await updateAction(state);
      return { ok: true };
    }

    case 'GET_HISTORY':
      return getCheckHistory();

    case 'CLEAR_HISTORY':
      await clearCheckHistory();
      return { ok: true };
  }
});

void configureAlarm();
