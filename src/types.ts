export type IpFamily = 'ipv4' | 'ipv6';
export type NetworkStatus = 'ok' | 'mismatch' | 'partial' | 'offline';
export type FlagStyle = 'round' | 'rectangle';

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
}

export type RuntimeMessage =
  | { type: 'GET_STATE' }
  | { type: 'REFRESH'; force?: boolean }
  | { type: 'SET_FLAG_STYLE'; style: FlagStyle };
