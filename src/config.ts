export const CONFIG = {
  ip: {
    ipv4Url: 'https://api.ipify.org?format=json',
    ipv6Url: 'https://api6.ipify.org?format=json'
  },
  geo: {
    baseUrl: 'https://api.ipapi.is',
    cacheTtlMs: 24 * 60 * 60 * 1000,
    maxEntries: 50
  },
  refresh: {
    currentStateTtlMs: 60 * 1000,
    alarmMinutes: 5,
    requestTimeoutMs: 5_000
  }
} as const;
