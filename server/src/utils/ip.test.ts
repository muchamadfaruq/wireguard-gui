import { describe, expect, it } from 'vitest';
import {
  intToIp,
  ipToInt,
  nextFreeHostIp,
  parseCidr,
  serverAddressFromCidr,
  subnetFromAddress,
} from './ip';

describe('ip utils', () => {
  it('converts ip to int and back', () => {
    expect(intToIp(ipToInt('10.8.0.1'))).toBe('10.8.0.1');
    expect(intToIp(ipToInt('192.168.1.230'))).toBe('192.168.1.230');
  });

  it('parses CIDR', () => {
    const cidr = parseCidr('10.8.0.0/24');
    expect(cidr.prefix).toBe(24);
    expect(intToIp(cidr.network)).toBe('10.8.0.0');
  });

  it('computes the server address', () => {
    expect(serverAddressFromCidr('10.8.0.0/24')).toBe('10.8.0.1/24');
    expect(serverAddressFromCidr('192.168.50.0/24')).toBe('192.168.50.1/24');
  });

  it('derives the subnet from a host address', () => {
    expect(subnetFromAddress('10.8.0.1/24')).toBe('10.8.0.0/24');
    expect(subnetFromAddress('10.9.3.7/16')).toBe('10.9.0.0/16');
  });

  it('finds the next free host address', () => {
    expect(nextFreeHostIp('10.8.0.0/24', [])).toBe('10.8.0.2');
    expect(nextFreeHostIp('10.8.0.0/24', ['10.8.0.2', '10.8.0.3'])).toBe('10.8.0.4');
    expect(nextFreeHostIp('10.8.0.0/24', ['10.8.0.2', '10.8.0.4'])).toBe('10.8.0.3');
  });

  it('ignores the prefix when matching used addresses', () => {
    expect(nextFreeHostIp('10.8.0.0/24', ['10.8.0.2/32'])).toBe('10.8.0.3');
  });

  it('throws on invalid input', () => {
    expect(() => parseCidr('10.8.0.0')).toThrow();
    expect(() => parseCidr('10.8.0.0/40')).toThrow();
  });
});
