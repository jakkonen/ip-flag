import { CONFIG } from '../config';
import type { CachedGeoInfo, GeoInfo } from '../types';
import { countryNameFromCode } from './country';
import { getGeoCache, setGeoCache } from './storage';

interface IpApiResponse {
  cc?: string;
  asn_num?: number;
  asn_org?: string;
  company_name?: string;
  location?: {
    country?: string;
    country_code?: string;
  };
  asn?: {
    asn?: number;
    org?: string;
  };
  company?: {
    name?: string;
  };
}

function pruneCache(cache: Record<string, CachedGeoInfo>): Record<string, CachedGeoInfo> {
  const entries = Object.entries(cache)
    .sort((a, b) => b[1].lastUsedAt - a[1].lastUsedAt)
    .slice(0, CONFIG.geo.maxEntries);

  return Object.fromEntries(entries);
}

export async function getGeoInfo(ip: string, force = false): Promise<GeoInfo> {
  const now = Date.now();
  const cache = await getGeoCache();
  const cached = cache[ip];

  if (!force && cached && now - cached.checkedAt < CONFIG.geo.cacheTtlMs) {
    cache[ip] = { ...cached, lastUsedAt: now };
    await setGeoCache(pruneCache(cache));
    return cached;
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
    if (cached) return cached;
    throw new Error(`GeoIP lookup failed: HTTP ${response.status}`);
  }

  const data = (await response.json()) as IpApiResponse;
  const countryCode = (data.cc ?? data.location?.country_code)?.toUpperCase();
  const countryName = countryCode ? (data.location?.country ?? countryNameFromCode(countryCode)) : undefined;

  if (!countryCode || !countryName) {
    if (cached) return cached;
    throw new Error('GeoIP response does not contain country data');
  }

  const info: CachedGeoInfo = {
    countryCode,
    countryName,
    asn: data.asn_num ?? data.asn?.asn,
    organization: data.company_name ?? data.company?.name ?? data.asn_org ?? data.asn?.org,
    checkedAt: now,
    lastUsedAt: now
  };

  cache[ip] = info;
  await setGeoCache(pruneCache(cache));

  return info;
}
