import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config';
import { peerRepo, serverRepo } from '../db/repositories';
import type { Peer, ServerConfig } from '../types';
import { subnetFromAddress } from '../utils/ip';
import { derivePublicKey } from './keys';

export interface HostPeer {
  name?: string;
  publicKey: string;
  presharedKey?: string;
  allowedIps?: string;
  persistentKeepalive?: number;
}

export interface HostConfig {
  interface: {
    privateKey?: string;
    address?: string;
    dns?: string;
    mtu?: number;
    listenPort?: number;
  };
  peers: HostPeer[];
}

export function hostConfigPath(interfaceName: string): string {
  return path.join(config.hostWgDir, `${interfaceName}.conf`);
}

export function parseHostConfig(text: string): HostConfig {
  const result: HostConfig = { interface: {}, peers: [] };
  let section: 'Interface' | 'Peer' | null = null;
  let currentPeer: HostPeer | null = null;
  let lastComment: string | undefined;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith('#')) {
      lastComment = line.replace(/^#+\s*/, '').trim();
      continue;
    }

    if (line.toLowerCase() === '[interface]') {
      section = 'Interface';
      currentPeer = null;
      continue;
    }
    if (line.toLowerCase() === '[peer]') {
      section = 'Peer';
      currentPeer = { publicKey: '', name: lastComment };
      result.peers.push(currentPeer);
      lastComment = undefined;
      continue;
    }

    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim().toLowerCase();
    const value = line.slice(eq + 1).trim();

    if (section === 'Interface') {
      switch (key) {
        case 'privatekey':
          result.interface.privateKey = value;
          break;
        case 'address':
          result.interface.address = value.split(',')[0]?.trim();
          break;
        case 'dns':
          result.interface.dns = value;
          break;
        case 'mtu':
          result.interface.mtu = Number.parseInt(value, 10) || undefined;
          break;
        case 'listenport':
          result.interface.listenPort = Number.parseInt(value, 10) || undefined;
          break;
      }
    } else if (section === 'Peer' && currentPeer) {
      switch (key) {
        case 'publickey':
          currentPeer.publicKey = value;
          break;
        case 'presharedkey':
          currentPeer.presharedKey = value;
          break;
        case 'allowedips':
          currentPeer.allowedIps = value;
          break;
        case 'persistentkeepalive':
          currentPeer.persistentKeepalive = Number.parseInt(value, 10) || undefined;
          break;
      }
    }
  }

  return result;
}

export interface HostConfigSummary {
  interface: string;
  file: string;
  exists: boolean;
  address: string | null;
  listenPort: number | null;
  peerCount: number;
}

export function getHostConfigSummary(interfaceName: string): HostConfigSummary {
  const file = hostConfigPath(interfaceName);
  if (!fs.existsSync(file)) {
    return { interface: interfaceName, file, exists: false, address: null, listenPort: null, peerCount: 0 };
  }
  const parsed = parseHostConfig(fs.readFileSync(file, 'utf8'));
  return {
    interface: interfaceName,
    file,
    exists: true,
    address: parsed.interface.address ?? null,
    listenPort: parsed.interface.listenPort ?? null,
    peerCount: parsed.peers.filter((peer) => peer.publicKey).length,
  };
}

export interface AdoptResult {
  server: ServerConfig;
  importedPeers: number;
}

/**
 * Imports an existing host WireGuard configuration into the database and marks
 * the server as externally managed. The host file is never modified.
 */
export async function adoptHostConfig(interfaceName: string): Promise<AdoptResult> {
  const file = hostConfigPath(interfaceName);
  if (!fs.existsSync(file)) {
    throw new Error(`Host configuration not found: ${file}`);
  }
  const parsed = parseHostConfig(fs.readFileSync(file, 'utf8'));
  if (!parsed.interface.privateKey || !parsed.interface.address) {
    throw new Error('Host configuration is missing a [Interface] PrivateKey or Address');
  }

  const publicKey = await derivePublicKey(parsed.interface.privateKey);
  const address = parsed.interface.address;
  const subnet = subnetFromAddress(address);

  const server = serverRepo.update({
    privateKey: parsed.interface.privateKey,
    publicKey,
    address,
    subnet,
    listenPort: parsed.interface.listenPort ?? config.env.WG_PORT,
    mtu: parsed.interface.mtu ?? config.env.WG_MTU,
    dns: parsed.interface.dns ?? config.env.WG_DNS,
    endpoint: config.env.WG_ENDPOINT === 'auto' ? '' : config.env.WG_ENDPOINT,
    persistentKeepalive: config.env.WG_PERSISTENT_KEEPALIVE,
    enabled: true,
    managedExternally: true,
  });

  const existingKeys = new Set(peerRepo.list().map((peer) => peer.publicKey));
  let imported = 0;
  let index = 1;
  for (const hostPeer of parsed.peers) {
    if (!hostPeer.publicKey || existingKeys.has(hostPeer.publicKey)) continue;
    const allowedIps = hostPeer.allowedIps || '';
    const peerAddress = (allowedIps.split(',')[0]?.trim() || `${address}`).split('/')[0] ?? '';
    const created: Peer = peerRepo.insert({
      name: hostPeer.name || `peer-${index}`,
      publicKey: hostPeer.publicKey,
      privateKey: '',
      presharedKey: hostPeer.presharedKey ?? null,
      address: peerAddress ? `${peerAddress}/32` : '',
      allowedIps: allowedIps || (peerAddress ? `${peerAddress}/32` : ''),
      persistentKeepalive: hostPeer.persistentKeepalive ?? config.env.WG_PERSISTENT_KEEPALIVE,
      enabled: true,
      notes: 'Imported from host configuration',
    });
    existingKeys.add(created.publicKey);
    imported += 1;
    index += 1;
  }

  return { server, importedPeers: imported };
}
