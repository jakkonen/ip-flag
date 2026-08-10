import { describe, expect, it } from 'vitest';
import { calculateStatus } from '../src/lib/status';
import type { IpState } from '../src/types';

function ip(family: 'ipv4' | 'ipv6', countryCode: string): IpState {
  return {
    family,
    address: family === 'ipv4' ? '203.0.113.1' : '2001:db8::1',
    countryCode,
    countryName: countryCode,
    checkedAt: 1
  };
}

describe('calculateStatus', () => {
  it('returns offline when neither family is available', () => {
    expect(calculateStatus()).toBe('offline');
  });

  it('returns partial when only one family is available', () => {
    expect(calculateStatus(ip('ipv4', 'FI'))).toBe('partial');
  });

  it('returns ok when IPv4 and IPv6 countries match', () => {
    expect(calculateStatus(ip('ipv4', 'FI'), ip('ipv6', 'FI'))).toBe('ok');
  });

  it('returns mismatch when countries differ', () => {
    expect(calculateStatus(ip('ipv4', 'DE'), ip('ipv6', 'FI'))).toBe('mismatch');
  });
});
