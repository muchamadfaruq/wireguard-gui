import { describe, expect, it } from 'vitest';
import { composeHostConfig, hashContent, readInterfaceBlock, renderPeerBlocks } from './host-sync';
import type { Peer } from '../types';

const INTERFACE = `[Interface]
# server owned by host
Address = 10.10.0.1/24
ListenPort = 51830
PrivateKey = SERVER_KEY=
MTU = 1400
PostUp = iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE`;

const FILE = `${INTERFACE}

# alice
[Peer]
PublicKey = ALICE=
AllowedIPs = 10.10.0.2/32
`;

function peer(overrides: Partial<Peer> = {}): Peer {
  return {
    id: 'p1',
    name: 'alice',
    publicKey: 'ALICE=',
    privateKey: '',
    presharedKey: 'PSK=',
    address: '10.10.0.2/32',
    allowedIps: '10.10.0.2/32',
    persistentKeepalive: 25,
    enabled: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    notes: null,
    ...overrides,
  };
}

describe('host-sync', () => {
  it('reads the interface block verbatim (before the first peer)', () => {
    const block = readInterfaceBlock(FILE);
    expect(block).toContain('[Interface]');
    expect(block).toContain('PostUp = iptables');
    expect(block).toContain('PostDown = iptables');
    expect(block).not.toContain('[Peer]');
    expect(block).not.toContain('ALICE=');
  });

  it('renders peer blocks for enabled peers only', () => {
    const rendered = renderPeerBlocks([
      peer(),
      peer({ id: 'p2', name: 'bob', publicKey: 'BOB=', enabled: false }),
    ]);
    expect(rendered).toContain('# alice');
    expect(rendered).toContain('PublicKey = ALICE=');
    expect(rendered).toContain('PresharedKey = PSK=');
    expect(rendered).toContain('AllowedIPs = 10.10.0.2/32');
    expect(rendered).toContain('PersistentKeepalive = 25');
    expect(rendered).not.toContain('BOB=');
  });

  it('composes a config that preserves the interface block', () => {
    const next = composeHostConfig(readInterfaceBlock(FILE), [peer()]);
    expect(next.startsWith('[Interface]')).toBe(true);
    expect(next).toContain('PostUp = iptables');
    expect(next).toContain('# alice');
    expect(next).toContain('PublicKey = ALICE=');
    // round-trips: the interface block of the new content is unchanged
    expect(readInterfaceBlock(next)).toBe(readInterfaceBlock(FILE));
  });

  it('produces a stable content hash', () => {
    expect(hashContent('abc')).toBe(hashContent('abc'));
    expect(hashContent('abc')).not.toBe(hashContent('abd'));
  });
});
