import type { IpState, NetworkStatus } from '../types';

export function calculateStatus(ipv4?: IpState, ipv6?: IpState): NetworkStatus {
  if (!ipv4 && !ipv6) return 'offline';
  if (!ipv4 || !ipv6) return 'partial';
  if (!ipv4.countryCode || !ipv6.countryCode) return 'partial';
  if (ipv4.countryCode !== ipv6.countryCode) return 'mismatch';
  return 'ok';
}
