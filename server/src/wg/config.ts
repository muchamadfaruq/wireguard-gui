import type { ParsedWireGuardConfig, Peer, ServerConfig } from '../types';

function sectionName(line: string): 'Interface' | 'Peer' | null {
  const lower = line.toLowerCase();
  if (lower === '[interface]') return 'Interface';
  if (lower === '[peer]') return 'Peer';
  return null;
}

export function parseWireGuardConfig(text: string): ParsedWireGuardConfig {
  const result: ParsedWireGuardConfig = { interface: {}, peers: [] };
  let current: 'Interface' | 'Peer' | null = null;
  let currentPeer: ParsedWireGuardConfig['peers'][number] | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const section = sectionName(line);
    if (section === 'Interface') {
      current = 'Interface';
      currentPeer = null;
      continue;
    }
    if (section === 'Peer') {
      current = 'Peer';
      currentPeer = {};
      result.peers.push(currentPeer);
      continue;
    }

    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim().toLowerCase();
    const value = line.slice(eq + 1).trim();

    if (current === 'Interface') {
      switch (key) {
        case 'privatekey':
          result.interface.privateKey = value;
          break;
        case 'address':
          result.interface.address = value;
          break;
        case 'dns':
          result.interface.dns = value;
          break;
        case 'mtu':
          result.interface.mtu = Number.parseInt(value, 10);
          break;
        case 'listenport':
          result.interface.listenPort = Number.parseInt(value, 10);
          break;
      }
    } else if (current === 'Peer' && currentPeer) {
      switch (key) {
        case 'publickey':
          currentPeer.publicKey = value;
          break;
        case 'presharedkey':
          currentPeer.presharedKey = value;
          break;
        case 'endpoint':
          currentPeer.endpoint = value;
          break;
        case 'allowedips':
          currentPeer.allowedIps = value;
          break;
        case 'persistentkeepalive':
          currentPeer.persistentKeepalive = Number.parseInt(value, 10);
          break;
      }
    }
  }

  return result;
}

function natRules(server: ServerConfig, egress: string): { up: string; down: string } {
  const subnet = server.subnet;
  const up = [
    `sysctl -w net.ipv4.ip_forward=1 || true`,
    `sysctl -w net.ipv6.conf.all.forwarding=1 || true`,
    `iptables -A FORWARD -i %i -j ACCEPT`,
    `iptables -A FORWARD -o %i -j ACCEPT`,
    `iptables -t nat -A POSTROUTING -s ${subnet} -o ${egress} -j MASQUERADE`,
  ].join('; ');
  const down = [
    `iptables -D FORWARD -i %i -j ACCEPT`,
    `iptables -D FORWARD -o %i -j ACCEPT`,
    `iptables -t nat -D POSTROUTING -s ${subnet} -o ${egress} -j MASQUERADE`,
  ].join('; ');
  return { up, down };
}

export function generateServerConfig(
  server: ServerConfig,
  peers: Peer[],
  egressInterface = 'eth0',
): string {
  const lines: string[] = [];
  lines.push('[Interface]');
  lines.push(`Address = ${server.address}`);
  lines.push(`ListenPort = ${server.listenPort}`);
  lines.push(`PrivateKey = ${server.privateKey}`);
  if (server.mtu) lines.push(`MTU = ${server.mtu}`);
  lines.push('SaveConfig = false');
  const rules = natRules(server, egressInterface);
  lines.push(`PostUp = ${rules.up}`);
  lines.push(`PostDown = ${rules.down}`);
  lines.push('');

  for (const peer of peers) {
    if (!peer.enabled) continue;
    lines.push(`# ${peer.name}`);
    lines.push('[Peer]');
    lines.push(`PublicKey = ${peer.publicKey}`);
    if (peer.presharedKey) lines.push(`PresharedKey = ${peer.presharedKey}`);
    lines.push(`AllowedIPs = ${peer.allowedIps}`);
    if (peer.persistentKeepalive > 0) {
      lines.push(`PersistentKeepalive = ${peer.persistentKeepalive}`);
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd() + '\n';
}

export function generateClientConfig(server: ServerConfig, peer: Peer): string {
  const lines: string[] = [];
  lines.push('[Interface]');
  lines.push(`PrivateKey = ${peer.privateKey}`);
  lines.push(`Address = ${peer.address}`);
  if (server.dns) lines.push(`DNS = ${server.dns}`);
  if (server.mtu) lines.push(`MTU = ${server.mtu}`);
  lines.push('');
  lines.push('[Peer]');
  lines.push(`PublicKey = ${server.publicKey}`);
  if (peer.presharedKey) lines.push(`PresharedKey = ${peer.presharedKey}`);
  const endpoint = server.endpoint ? `${server.endpoint}:${server.listenPort}` : '';
  if (endpoint) lines.push(`Endpoint = ${endpoint}`);
  lines.push(`AllowedIPs = ${server.allowedIps}`);
  const keepalive = peer.persistentKeepalive || server.persistentKeepalive;
  if (keepalive > 0) lines.push(`PersistentKeepalive = ${keepalive}`);
  return lines.join('\n') + '\n';
}
