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

interface IpWhoisResponse {
  success?: boolean;
  region?: string;
  city?: string;
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

async function lookupCity(ip: string): Promise<Pick<GeoInfo, 'region' | 'city'>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONFIG.refresh.requestTimeoutMs);

  try {
    const response = await fetch(`${CONFIG.geo.cityUrl}/${encodeURIComponent(ip)}`, {
      cache: 'no-store',
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`City lookup failed: HTTP ${response.status}`);

    const data = (await response.json()) as IpWhoisResponse;
    if (!data.success) throw new Error('City lookup failed');
    return { region: data.region, city: data.city };
  } finally {
    clearTimeout(timer);
  }
}

export async function getGeoInfo(ip: string, force = false, includeCity = false): Promise<GeoLookupResult> {
  const now = Date.now();
  const cache = await getGeoCache();
  const cached = cache[ip];

  const isFresh = !force && cached?.cacheVersion === 6 && now - cached.checkedAt < CONFIG.geo.cacheTtlMs;
  let info: CachedGeoInfo;
  let source: GeoLookupResult['source'];

  if (isFresh) {
    info = { ...cached, lastUsedAt: now };
    source = 'cache';
  } else {
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

    info = {
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
      cacheVersion: 6
    };
    source = 'request';
  }

  if (includeCity && (!info.cityCheckedAt || now - info.cityCheckedAt >= CONFIG.geo.cacheTtlMs)) {
    try {
      info = { ...info, ...(await lookupCity(ip)), cityCheckedAt: now };
    } catch {
      info = { ...info, cityCheckedAt: now };
    }
  }

  cache[ip] = info;
  await setGeoCache(pruneCache(cache));

  if (!includeCity) {
    const { region: _region, city: _city, ...baseInfo } = info;
    return { info: baseInfo, source };
  }

  return { info, source };
}
