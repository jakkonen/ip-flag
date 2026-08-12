import { CONFIG } from '../config';
import type { CachedGeoInfo, GeoInfo } from '../types';
import { countryNameFromCode } from './country';
import { getGeoCache, setGeoCache } from './storage';

interface IpApiResponse {
  cc?: string;
  country?: string;
  country_code?: string;
  asn_num?: number;
  asn_org?: string;
  company_name?: string;
  location?: {
    country?: string;
    country_code?: string;
  } | string;
  asn?: {
    asn?: number;
    org?: string;
  };
  company?: {
    name?: string;
    type?: string;
  };
  is_datacenter?: boolean;
  is_vpn?: boolean;
  is_proxy?: boolean;
  is_tor?: boolean;
}

export interface GeoLookupResult {
  info: GeoInfo;
  source: 'cache' | 'request';
}

function locationFromResponse(data: IpApiResponse): Exclude<IpApiResponse['location'], string | undefined> {
  if (typeof data.location === 'object' && data.location) return data.location;
  if (typeof data.location !== 'string') return {};

  try {
    const parsed = JSON.parse(data.location) as unknown;
    return typeof parsed === 'object' && parsed ? parsed as Exclude<IpApiResponse['location'], string | undefined> : {};
  } catch {
    return {};
  }
}

function pruneCache(cache: Record<string, CachedGeoInfo>): Record<string, CachedGeoInfo> {
  const entries = Object.entries(cache)
    .sort((a, b) => b[1].lastUsedAt - a[1].lastUsedAt)
    .slice(0, CONFIG.geo.maxEntries);

  return Object.fromEntries(entries);
}

export async function getGeoInfo(ip: string, force = false): Promise<GeoLookupResult> {
  const now = Date.now();
  const cache = await getGeoCache();
  const cached = cache[ip];

  if (!force && cached?.cacheVersion === 5 && now - cached.checkedAt < CONFIG.geo.cacheTtlMs) {
    cache[ip] = { ...cached, lastUsedAt: now };
    await setGeoCache(pruneCache(cache));
    return { info: cached, source: 'cache' };
  }

  const url = `${CONFIG.geo.baseUrl}/?q=${encodeURIComponent(ip)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONFIG.refresh.requestTimeoutMs);
  let response: Response;

  try {
    response = await fetch(url, { cache: 'no-store', signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    if (cached) return { info: cached, source: 'cache' };
    throw new Error(`GeoIP lookup failed: HTTP ${response.status}`);
  }

  const data = (await response.json()) as IpApiResponse;
  const location = locationFromResponse(data);
  const countryCode = (data.cc ?? data.country_code ?? location.country_code)?.toUpperCase();
  const countryName = countryCode ? (data.country ?? location.country ?? countryNameFromCode(countryCode)) : undefined;

  if (!countryCode || !countryName) {
    if (cached) return { info: cached, source: 'cache' };
    throw new Error('GeoIP response does not contain country data');
  }

  const info: CachedGeoInfo = {
    countryCode,
    countryName,
    asn: data.asn_num ?? data.asn?.asn,
    organization: data.company_name ?? data.company?.name ?? data.asn_org ?? data.asn?.org,
    networkType: data.company?.type,
    isDatacenter: data.is_datacenter,
    isVpn: data.is_vpn,
    isProxy: data.is_proxy,
    isTor: data.is_tor,
    checkedAt: now,
    lastUsedAt: now,
    cacheVersion: 5
  };

  cache[ip] = info;
  await setGeoCache(pruneCache(cache));

  return { info, source: 'request' };
}
