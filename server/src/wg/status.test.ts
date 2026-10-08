import { describe, expect, it } from 'vitest';
import { parseWgDump } from './status';

describe('parseWgDump', () => {
  it('parses interface and peer lines', () => {
    const dump = [
      'PRIVATE\tPUBLIC\t51820\toff',
      'PEERKEY\tPSK\t1.2.3.4:12345\t10.8.0.2/32\t1700000000\t1024\t2048\t25',
    ].join('\n');

    const parsed = parseWgDump(dump);
    expect(parsed.publicKey).toBe('PUBLIC');
    expect(parsed.listenPort).toBe(51820);
    expect(parsed.peers).toHaveLength(1);
    const peer = parsed.peers[0]!;
    expect(peer.publicKey).toBe('PEERKEY');
    expect(peer.endpoint).toBe('1.2.3.4:12345');
    expect(peer.transferRx).toBe(1024);
    expect(peer.transferTx).toBe(2048);
    expect(peer.persistentKeepalive).toBe(25);
  });

  it('handles "never" endpoints and no handshake', () => {
    const dump = ['P\tQ\t51820\toff', 'PEER\t(none)\t(none)\t10.8.0.3/32\t0\t0\t0\toff'].join('\n');
    const parsed = parseWgDump(dump);
    const peer = parsed.peers[0]!;
    expect(peer.endpoint).toBeNull();
    expect(peer.latestHandshake).toBeNull();
    expect(peer.persistentKeepalive).toBeNull();
    expect(peer.online).toBe(false);
  });

  it('returns an empty structure for empty input', () => {
    const parsed = parseWgDump('');
    expect(parsed.peers).toHaveLength(0);
  });
});
