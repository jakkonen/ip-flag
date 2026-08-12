export type IpFamily = 'ipv4' | 'ipv6';
export type NetworkStatus = 'ok' | 'mismatch' | 'partial' | 'offline';
export type FlagStyle = 'round' | 'rectangle';
export type CheckTrigger = 'startup' | 'popup' | 'manual' | 'alarm' | 'newTab';

export interface GeoInfo {
  countryCode?: string;
  countryName?: string;
  asn?: number;
  organization?: string;
  checkedAt: number;
}

export interface IpState extends GeoInfo {
  family: IpFamily;
  address: string;
  geoSource?: 'cache' | 'request';
}

export interface NetworkState {
  ipv4?: IpState;
  ipv6?: IpState;
  checkedAt: number;
  status: NetworkStatus;
}

export interface CachedGeoInfo extends GeoInfo {
  countryCode: string;
  countryName: string;
  lastUsedAt: number;
}

export interface UserSettings {
  flagStyle: FlagStyle;
  refreshOnStartup: boolean;
  refreshOnPopupOpen: boolean;
  refreshOnNewTab: boolean;
  scheduledRefreshEnabled: boolean;
  refreshIntervalMinutes: 0.5 | 1 | 5 | 15 | 30;
  notifyIpChange: boolean;
  notifyCountryChange: boolean;
}

export interface CheckHistoryEntry {
  checkedAt: number;
  trigger: CheckTrigger;
  status: NetworkStatus;
  ipv4?: Pick<IpState, 'address' | 'countryCode' | 'countryName' | 'geoSource'>;
  ipv6?: Pick<IpState, 'address' | 'countryCode' | 'countryName' | 'geoSource'>;
  changes: {
    ipv4Address: boolean;
    ipv6Address: boolean;
    ipv4Country: boolean;
    ipv6Country: boolean;
  };
}

export type RuntimeMessage =
  | { type: 'GET_STATE' }
  | { type: 'OPEN_POPUP' }
  | { type: 'REFRESH'; force?: boolean }
  | { type: 'SET_SETTINGS'; settings: UserSettings }
  | { type: 'GET_HISTORY' }
  | { type: 'CLEAR_HISTORY' };
