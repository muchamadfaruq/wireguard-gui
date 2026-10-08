import type { PeerRuntimeStatus } from '../types';

export interface WgDump {
  privateKey: string;
  publicKey: string;
  listenPort: number;
  peers: PeerRuntimeStatus[];
}

const HANDSHAKE_ONLINE_WINDOW_SECONDS = 180;

export function parseWgDump(dump: string): WgDump {
  const lines = dump
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => l.length > 0);

  const result: WgDump = { privateKey: '', publicKey: '', listenPort: 0, peers: [] };
  if (lines.length === 0) return result;

  const header = lines[0]!.split('\t');
  result.privateKey = header[0] ?? '';
  result.publicKey = header[1] ?? '';
  result.listenPort = Number.parseInt(header[2] ?? '0', 10) || 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i]!.split('\t');
    const publicKey = cols[0] ?? '';
    const endpoint = cols[2] ?? '';
    const allowedIps = cols[3] ?? '';
    const latestHandshake = cols[4] ?? '0';
    const rx = cols[5] ?? '0';
    const tx = cols[6] ?? '0';
    const keepalive = cols[7] ?? '';
    const handshake = Number.parseInt(latestHandshake, 10) || 0;
    result.peers.push({
      publicKey,
      endpoint: endpoint && endpoint !== '(none)' ? endpoint : null,
      allowedIps: allowedIps || null,
      latestHandshake: handshake > 0 ? handshake : null,
      transferRx: Number.parseInt(rx, 10) || 0,
      transferTx: Number.parseInt(tx, 10) || 0,
      persistentKeepalive:
        keepalive && keepalive !== 'off' ? Number.parseInt(keepalive, 10) : null,
      online:
        handshake > 0 && Math.floor(Date.now() / 1000) - handshake < HANDSHAKE_ONLINE_WINDOW_SECONDS,
    });
  }

  return result;
}
