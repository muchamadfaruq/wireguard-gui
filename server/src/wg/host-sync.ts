import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { config } from '../config';
import { peerRepo, serverRepo } from '../db/repositories';
import type { Peer, ServerConfig } from '../types';
import { subnetFromAddress } from '../utils/ip';
import { hostConfigPath, parseHostConfig, type HostPeer } from './adopt';
import { derivePublicKey } from './keys';

/**
 * Tracks the hash of the last content written by the application. It is used to
 * ignore filesystem events caused by our own writes (loop prevention).
 */
let lastWrittenHash: string | null = null;

export function hashContent(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

export function getLastWrittenHash(): string | null {
  return lastWrittenHash;
}

/** Returns the Interface block, i.e. everything before the first peer.
 *  Comment/blank lines immediately preceding the first `[Peer]` are treated as
 *  belonging to the peer section and are excluded.
 */
export function readInterfaceBlock(text: string): string {
  const lines = text.split(/\r?\n/);
  let peerIndex = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i]!.trim().toLowerCase() === '[peer]') {
      peerIndex = i;
      break;
    }
  }
  let end = peerIndex === -1 ? lines.length : peerIndex;
  while (end > 0) {
    const line = lines[end - 1]!.trim();
    if (line === '' || line.startsWith('#')) end -= 1;
    else break;
  }
  const out = lines.slice(0, end);
  while (out.length > 0 && out[out.length - 1]!.trim() === '') out.pop();
  return out.join('\n');
}

export function renderPeerBlocks(peers: Peer[]): string {
  const blocks: string[] = [];
  for (const peer of peers) {
    if (!peer.enabled) continue;
    const lines = [`# ${peer.name}`, '[Peer]', `PublicKey = ${peer.publicKey}`];
    if (peer.presharedKey) lines.push(`PresharedKey = ${peer.presharedKey}`);
    if (peer.allowedIps) lines.push(`AllowedIPs = ${peer.allowedIps}`);
    if (peer.persistentKeepalive > 0) {
      lines.push(`PersistentKeepalive = ${peer.persistentKeepalive}`);
    }
    blocks.push(lines.join('\n'));
  }
  return blocks.join('\n\n');
}

/** Renders a peer block for a peer that only exists in the host file (i.e. it
 *  is not managed by the database), so it can be preserved verbatim on write
 *  instead of being silently dropped. */
export function renderHostPeerBlock(hostPeer: HostPeer): string {
  const lines = [`# ${hostPeer.name ?? 'peer'}`, '[Peer]', `PublicKey = ${hostPeer.publicKey}`];
  if (hostPeer.presharedKey) lines.push(`PresharedKey = ${hostPeer.presharedKey}`);
  if (hostPeer.allowedIps) lines.push(`AllowedIPs = ${hostPeer.allowedIps}`);
  if (hostPeer.persistentKeepalive) {
    lines.push(`PersistentKeepalive = ${hostPeer.persistentKeepalive}`);
  }
  return lines.join('\n');
}

/**
 * Picks the host-file peers that must survive a write: those present in the
 * file but managed neither by the database nor by an explicit removal request.
 * Without this, writing the database state back to the host file would delete
 * any peer the database does not know about (data loss, e.g. after a reset or a
 * partial import).
 */
export function selectPreservedHostPeers(
  hostPeers: HostPeer[],
  dbPeers: Peer[],
  removePublicKeys: Iterable<string> = [],
): HostPeer[] {
  const known = new Set(dbPeers.map((peer) => peer.publicKey));
  const removed = new Set(removePublicKeys);
  return hostPeers.filter(
    (hostPeer) =>
      Boolean(hostPeer.publicKey) && !known.has(hostPeer.publicKey) && !removed.has(hostPeer.publicKey),
  );
}

export function composeHostConfig(
  interfaceBlock: string,
  peers: Peer[],
  preserved: HostPeer[] = [],
): string {
  const blocks = [renderPeerBlocks(peers), ...preserved.map(renderHostPeerBlock)].filter(Boolean);
  const peerPart = blocks.join('\n\n');
  return peerPart ? `${interfaceBlock}\n\n${peerPart}\n` : `${interfaceBlock}\n`;
}

/** Whether the host configuration file exists and can be written to. */
export function hostWritable(iface: string): boolean {
  const file = hostConfigPath(iface);
  try {
    if (!fs.existsSync(file)) return false;
    fs.accessSync(file, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

export interface WriteResult {
  written: boolean;
  hash: string;
}

function backupDir(): string {
  return path.join(config.dataDir, 'backups', 'wgconfig');
}

export interface WriteOptions {
  /** Public keys that must be removed from the host file (explicit deletes). */
  removePublicKeys?: string[];
}

export function writeHostConfig(iface: string, peers: Peer[], options: WriteOptions = {}): WriteResult {
  const file = hostConfigPath(iface);
  if (!fs.existsSync(file)) {
    throw new Error(`Host configuration not found: ${file}`);
  }
  const current = fs.readFileSync(file, 'utf8');
  const preserved = selectPreservedHostPeers(
    parseHostConfig(current).peers,
    peers,
    options.removePublicKeys ?? [],
  );
  const next = composeHostConfig(readInterfaceBlock(current), peers, preserved);
  const nextHash = hashContent(next);
  if (nextHash === hashContent(current)) {
    lastWrittenHash = nextHash;
    return { written: false, hash: nextHash };
  }

  const dir = backupDir();
  fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.copyFileSync(file, path.join(dir, `${stamp}-${iface}.conf`));

  const tmp = path.join(path.dirname(file), `.${iface}.tmp-${process.pid}`);
  fs.writeFileSync(tmp, next, { mode: 0o600 });
  fs.renameSync(tmp, file);

  lastWrittenHash = nextHash;
  return { written: true, hash: nextHash };
}

export interface ImportResult {
  peerCount: number;
  changed: boolean;
}

/**
 * Reconciles the database with the current host file (file is authoritative).
 * - Interface fields are mirrored into the DB.
 * - Peers present in the file are created/updated and marked enabled.
 * - Peers enabled in the DB but absent from the file are removed.
 * - Disabled peers are expected to be absent and are kept.
 */
export async function importHostConfig(iface: string): Promise<ImportResult> {
  const file = hostConfigPath(iface);
  if (!fs.existsSync(file)) return { peerCount: 0, changed: false };
  const server = serverRepo.get();
  if (!server) return { peerCount: 0, changed: false };

  const text = fs.readFileSync(file, 'utf8');
  const hash = hashContent(text);
  const parsed = parseHostConfig(text);

  const patch: Partial<Omit<ServerConfig, 'id'>> = {};
  if (parsed.interface.address && parsed.interface.address !== server.address) {
    patch.address = parsed.interface.address;
    try {
      patch.subnet = subnetFromAddress(parsed.interface.address);
    } catch {
      // keep existing subnet when the address is not a CIDR
    }
  }
  if (parsed.interface.listenPort && parsed.interface.listenPort !== server.listenPort) {
    patch.listenPort = parsed.interface.listenPort;
  }
  if (parsed.interface.mtu && parsed.interface.mtu !== server.mtu) {
    patch.mtu = parsed.interface.mtu;
  }
  if (parsed.interface.dns && parsed.interface.dns !== server.dns) {
    patch.dns = parsed.interface.dns;
  }
  if (parsed.interface.privateKey && parsed.interface.privateKey !== server.privateKey) {
    patch.privateKey = parsed.interface.privateKey;
    patch.publicKey = await derivePublicKey(parsed.interface.privateKey);
  }

  const existing = peerRepo.list();
  const byKey = new Map(existing.map((peer) => [peer.publicKey, peer]));
  const hostKeys = new Set<string>();
  let changed = false;
  let index = 1;

  for (const hostPeer of parsed.peers) {
    if (!hostPeer.publicKey) continue;
    hostKeys.add(hostPeer.publicKey);
    const allowed = hostPeer.allowedIps?.trim() || '';
    const peerAddress = (allowed.split(',')[0]?.trim() || '').split('/')[0] || '';
    const allowedIps = allowed || (peerAddress ? `${peerAddress}/32` : '');
    const address = peerAddress ? `${peerAddress}/32` : '';
    const current = byKey.get(hostPeer.publicKey);

    if (!current) {
      peerRepo.insert({
        name: hostPeer.name || `peer-${index}`,
        publicKey: hostPeer.publicKey,
        privateKey: '',
        presharedKey: hostPeer.presharedKey ?? null,
        address,
        allowedIps,
        persistentKeepalive: hostPeer.persistentKeepalive ?? server.persistentKeepalive,
        enabled: true,
        notes: 'Imported from host configuration',
      });
      changed = true;
    } else {
      const nextPsk = hostPeer.presharedKey ?? null;
      const nextKeepalive = hostPeer.persistentKeepalive ?? current.persistentKeepalive;
      const nextAddress = address || current.address;
      if (
        nextPsk !== current.presharedKey ||
        nextKeepalive !== current.persistentKeepalive ||
        (allowedIps && allowedIps !== current.allowedIps) ||
        (nextAddress && nextAddress !== current.address) ||
        !current.enabled
      ) {
        peerRepo.update(current.id, {
          address: nextAddress,
          allowedIps: allowedIps || current.allowedIps,
          presharedKey: nextPsk,
          persistentKeepalive: nextKeepalive,
          enabled: true,
        });
        changed = true;
      }
    }
    index += 1;
  }

  for (const peer of existing) {
    if (peer.enabled && !hostKeys.has(peer.publicKey)) {
      peerRepo.delete(peer.id);
      changed = true;
    }
  }

  if (Object.keys(patch).length > 0) {
    serverRepo.update(patch);
    changed = true;
  }

  lastWrittenHash = hash;
  return { peerCount: parsed.peers.length, changed };
}

export interface HostWatcherHooks {
  onImported?: (result: ImportResult) => Promise<void> | void;
  onError?: (error: unknown) => void;
}

let watcher: fs.FSWatcher | null = null;
let debounceTimer: NodeJS.Timeout | null = null;

export function startHostWatcher(iface: string, hooks: HostWatcherHooks = {}): void {
  stopHostWatcher();
  const filename = `${iface}.conf`;
  try {
    watcher = fs.watch(config.hostWgDir, { persistent: false }, (_event, changed) => {
      if (changed && changed !== filename) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        void (async () => {
          try {
            const file = hostConfigPath(iface);
            if (!fs.existsSync(file)) return;
            const text = fs.readFileSync(file, 'utf8');
            if (hashContent(text) === lastWrittenHash) return; // our own write
            const result = await importHostConfig(iface);
            if (hooks.onImported) await hooks.onImported(result);
          } catch (error) {
            if (hooks.onError) hooks.onError(error);
            else console.error('host watcher error:', error);
          }
        })();
      }, 400);
    });
  } catch (error) {
    if (hooks.onError) hooks.onError(error);
    else console.error('failed to start host watcher:', error);
  }
}

export function stopHostWatcher(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  if (watcher) {
    watcher.close();
    watcher = null;
  }
}

export const _internal = {
  composeHostConfig,
  readInterfaceBlock,
  renderPeerBlocks,
  renderHostPeerBlock,
  selectPreservedHostPeers,
};
