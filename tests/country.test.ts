import { describe, expect, it } from 'vitest';
import { countryNameFromCode } from '../src/lib/country';

describe('countryNameFromCode', () => {
  it('resolves an ISO country code without a network request', () => {
    expect(countryNameFromCode('FI')).toBe('Finland');
  });
});
