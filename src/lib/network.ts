import { CONFIG } from '../config';
import type { IpFamily } from '../types';

interface IpifyResponse {
  ip: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONFIG.refresh.requestTimeoutMs);

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export async function getPublicIp(family: IpFamily): Promise<string | undefined> {
  const url = family === 'ipv4' ? CONFIG.ip.ipv4Url : CONFIG.ip.ipv6Url;

  try {
    const data = await fetchJson<IpifyResponse>(url);
    return data.ip || undefined;
  } catch {
    return undefined;
  }
}
