import { describe, expect, it } from 'vitest';
import { generateClientConfig, generateServerConfig, parseWireGuardConfig } from './config';
import type { Peer, ServerConfig } from '../types';

const server: ServerConfig = {
  id: 1,
  privateKey: 'SERVER_PRIVATE',
  publicKey: 'SERVER_PUBLIC',
  address: '10.8.0.1/24',
  subnet: '10.8.0.0/24',
  listenPort: 51820,
  mtu: 1420,
  dns: '1.1.1.1',
  endpoint: 'vpn.example.com',
  allowedIps: '0.0.0.0/0',
  persistentKeepalive: 25,
  enabled: true,
  managedExternally: false,
  writeThrough: false,
};

const peer: Peer = {
  id: 'p1',
  name: 'laptop',
  publicKey: 'PEER_PUBLIC',
  privateKey: 'PEER_PRIVATE',
  presharedKey: 'PSK',
  address: '10.8.0.2/32',
  allowedIps: '10.8.0.2/32',
  persistentKeepalive: 25,
  enabled: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  notes: null,
};

describe('wireguard config generation', () => {
  it('generates a client config', () => {
    const config = generateClientConfig(server, peer);
    expect(config).toContain('[Interface]');
    expect(config).toContain('PrivateKey = PEER_PRIVATE');
    expect(config).toContain('Address = 10.8.0.2/32');
    expect(config).toContain('DNS = 1.1.1.1');
    expect(config).toContain('PublicKey = SERVER_PUBLIC');
    expect(config).toContain('PresharedKey = PSK');
    expect(config).toContain('Endpoint = vpn.example.com:51820');
    expect(config).toContain('AllowedIPs = 0.0.0.0/0');
    expect(config).toContain('PersistentKeepalive = 25');
  });

  it('omits the endpoint when it is not configured', () => {
    const config = generateClientConfig({ ...server, endpoint: '' }, peer);
    expect(config).not.toContain('Endpoint =');
  });

  it('generates a server config with NAT rules and only enabled peers', () => {
    const disabled: Peer = { ...peer, id: 'p2', name: 'old', enabled: false, presharedKey: null };
    const config = generateServerConfig(server, [peer, disabled], 'eth0');
    expect(config).toContain('Address = 10.8.0.1/24');
    expect(config).toContain('ListenPort = 51820');
    expect(config).toContain('PostUp = ');
    expect(config).toContain('MASQUERADE');
    expect(config).toContain('# laptop');
    expect(config).not.toContain('# old');
  });
});

describe('parseWireGuardConfig', () => {
  it('parses interface and peers', () => {
    const text = [
      '[Interface]',
      'PrivateKey = abc=',
      'Address = 10.9.0.2/32',
      'DNS = 8.8.8.8',
      '',
      '[Peer]',
      'PublicKey = def=',
      'Endpoint = host:51820',
      'AllowedIPs = 0.0.0.0/0',
      'PersistentKeepalive = 25',
    ].join('\n');

    const parsed = parseWireGuardConfig(text);
    expect(parsed.interface.privateKey).toBe('abc=');
    expect(parsed.interface.address).toBe('10.9.0.2/32');
    expect(parsed.interface.dns).toBe('8.8.8.8');
    expect(parsed.peers).toHaveLength(1);
    expect(parsed.peers[0]?.publicKey).toBe('def=');
    expect(parsed.peers[0]?.endpoint).toBe('host:51820');
    expect(parsed.peers[0]?.persistentKeepalive).toBe(25);
  });

  it('ignores comments and blank lines', () => {
    const parsed = parseWireGuardConfig('# comment\n\n[Interface]\nPrivateKey = x=\n');
    expect(parsed.interface.privateKey).toBe('x=');
  });
});
