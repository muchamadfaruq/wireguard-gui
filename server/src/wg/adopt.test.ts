import { describe, expect, it } from 'vitest';
import { parseHostConfig } from './adopt';

const HOST_CONFIG = `[Interface]
# Server
Address = 10.10.0.1/24
ListenPort = 51830
PrivateKey = SERVER_PRIVATE_KEY=
MTU = 1400

# alice-laptop
[Peer]
PublicKey = ALICE_PUBLIC_KEY=
PresharedKey = ALICE_PSK=
AllowedIPs = 10.10.0.2/32
PersistentKeepalive = 25

# bob-phone
[Peer]
PublicKey = BOB_PUBLIC_KEY=
AllowedIPs = 10.10.0.3/32
`;

describe('parseHostConfig', () => {
  it('parses interface settings', () => {
    const parsed = parseHostConfig(HOST_CONFIG);
    expect(parsed.interface.privateKey).toBe('SERVER_PRIVATE_KEY=');
    expect(parsed.interface.address).toBe('10.10.0.1/24');
    expect(parsed.interface.listenPort).toBe(51830);
    expect(parsed.interface.mtu).toBe(1400);
  });

  it('parses peers with names from comments', () => {
    const parsed = parseHostConfig(HOST_CONFIG);
    expect(parsed.peers).toHaveLength(2);
    expect(parsed.peers[0]).toMatchObject({
      name: 'alice-laptop',
      publicKey: 'ALICE_PUBLIC_KEY=',
      presharedKey: 'ALICE_PSK=',
      allowedIps: '10.10.0.2/32',
      persistentKeepalive: 25,
    });
    expect(parsed.peers[1]).toMatchObject({
      name: 'bob-phone',
      publicKey: 'BOB_PUBLIC_KEY=',
      allowedIps: '10.10.0.3/32',
    });
  });

  it('takes the first address when multiple are listed', () => {
    const parsed = parseHostConfig('[Interface]\nAddress = 10.0.0.1/24, fd00::1/64\n');
    expect(parsed.interface.address).toBe('10.0.0.1/24');
  });

  it('handles an empty configuration', () => {
    const parsed = parseHostConfig('');
    expect(parsed.peers).toHaveLength(0);
    expect(parsed.interface.privateKey).toBeUndefined();
  });
});
