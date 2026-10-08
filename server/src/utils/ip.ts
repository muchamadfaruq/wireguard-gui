export interface Cidr {
  network: number;
  prefix: number;
  netmask: number;
}

export function ipToInt(ip: string): number {
  const parts = ip.split('.').map((p) => Number.parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) {
    throw new Error(`Invalid IPv4 address: ${ip}`);
  }
  const [a, b, c, d] = parts as [number, number, number, number];
  return ((a << 24) >>> 0) + (b << 16) + (c << 8) + d;
}

export function intToIp(value: number): string {
  const v = value >>> 0;
  return `${(v >>> 24) & 0xff}.${(v >>> 16) & 0xff}.${(v >>> 8) & 0xff}.${v & 0xff}`;
}

export function parseCidr(cidr: string): Cidr {
  const [ip, prefixRaw] = cidr.split('/');
  if (!ip || prefixRaw === undefined) {
    throw new Error(`Invalid CIDR: ${cidr}`);
  }
  const prefix = Number.parseInt(prefixRaw, 10);
  if (Number.isNaN(prefix) || prefix < 0 || prefix > 32) {
    throw new Error(`Invalid CIDR prefix: ${cidr}`);
  }
  const netmask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = (ipToInt(ip) & netmask) >>> 0;
  return { network, prefix, netmask };
}

export function serverAddressFromCidr(cidr: string): string {
  const { network, prefix } = parseCidr(cidr);
  return `${intToIp(network + 1)}/${prefix}`;
}

/**
 * Derives the network CIDR from a host address, e.g. "10.8.0.1/24" ->
 * "10.8.0.0/24".
 */
export function subnetFromAddress(address: string): string {
  const { network, prefix } = parseCidr(address);
  return `${intToIp(network)}/${prefix}`;
}

/**
 * Returns the next free host address (without prefix) in the CIDR, skipping
 * the network address, the server address (network+1) and all `used` addresses.
 */
export function nextFreeHostIp(cidr: string, used: string[]): string {
  const { network, prefix } = parseCidr(cidr);
  const hostCount = prefix >= 31 ? 2 : 2 ** (32 - prefix);
  const usedSet = new Set(used.map((ip) => ip.split('/')[0]));
  const first = network + 2; // network+1 is the server
  const last = network + hostCount - 1;
  for (let i = first; i <= last; i++) {
    const candidate = intToIp(i);
    if (!usedSet.has(candidate)) {
      return candidate;
    }
  }
  throw new Error(`No free IP address left in ${cidr}`);
}

export function isValidIpv4Cidr(value: string): boolean {
  try {
    parseCidr(value);
    return true;
  } catch {
    return false;
  }
}
