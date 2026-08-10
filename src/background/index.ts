import browser from '../lib/browser';
import { CONFIG } from '../config';
import type { RuntimeMessage } from '../types';
import { updateAction } from '../lib/icon';
import { refreshNetworkState } from '../lib/state';
import { getCurrentState, getSettings, setSettings } from '../lib/storage';

const ALARM_NAME = 'refresh-public-ip';

async function ensureAlarm(): Promise<void> {
  const alarm = await browser.alarms.get(ALARM_NAME);
  if (!alarm) {
    await browser.alarms.create(ALARM_NAME, {
      periodInMinutes: CONFIG.refresh.alarmMinutes
    });
  }
}

browser.runtime.onInstalled.addListener(() => {
  void ensureAlarm();
  void refreshNetworkState(true);
});

browser.runtime.onStartup.addListener(() => {
  void ensureAlarm();
  void refreshNetworkState(true);
});

browser.alarms.onAlarm.addListener((alarm: { name: string }) => {
  if (alarm.name === ALARM_NAME) {
    void refreshNetworkState(false);
  }
});

browser.runtime.onMessage.addListener(async (message: RuntimeMessage) => {
  switch (message.type) {
    case 'GET_STATE':
      return refreshNetworkState(false);

    case 'REFRESH':
      return refreshNetworkState(message.force ?? true);

    case 'SET_FLAG_STYLE': {
      const settings = await getSettings();
      await setSettings({ ...settings, flagStyle: message.style });
      const state = await getCurrentState();
      if (state) await updateAction(state);
      return { ok: true };
    }
  }
});

void ensureAlarm();
void refreshNetworkState(false);
