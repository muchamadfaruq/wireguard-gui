import { describe, expect, it } from 'vitest';
import { isValidIpv4 } from './public-ip';

describe('isValidIpv4', () => {
  it('accepts valid addresses', () => {
    expect(isValidIpv4('1.1.1.1')).toBe(true);
    expect(isValidIpv4('203.0.113.42')).toBe(true);
    expect(isValidIpv4('  10.0.0.1  ')).toBe(true);
  });

  it('rejects invalid values', () => {
    expect(isValidIpv4('vpn.example.com')).toBe(false);
    expect(isValidIpv4('999.0.0.1')).toBe(false);
    expect(isValidIpv4('')).toBe(false);
    expect(isValidIpv4('not an ip')).toBe(false);
  });
});
