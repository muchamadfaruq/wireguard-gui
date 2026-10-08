import QRCode from 'qrcode';
import { config } from '../config';
import { peerRepo, serverRepo } from '../db/repositories';
import type { Peer, PeerView } from '../types';
import { getBackend } from '../wg/backend';
import { generateClientConfig } from '../wg/config';
import { hostWritable, writeHostConfig } from '../wg/host-sync';
import { generateKeyPair, generatePresharedKey } from '../wg/keys';
import { nextFreeHostIp, normalizePeerAllowedIps } from '../utils/ip';
import { ApiError, notFound } from '../utils/http-error';
import { getInterfaceStatus } from './server-service';

/**
 * Persists the desired peer state (write-through to the host config when in
 * adopt mode) and applies it to the running interface. On failure the provided
 * rollback is executed so the database stays consistent with the host file.
 */
interface MutationOptions {
  /** Public keys to drop from the host file (explicit deletes). */
  removePublicKeys?: string[];
}

async function applyMutation(rollback?: () => void, options: MutationOptions = {}): Promise<void> {
  const server = serverRepo.get();
  if (!server) return;
  const iface = config.env.WG_INTERFACE;
  try {
    if (server.managedExternally && server.writeThrough && hostWritable(iface)) {
      writeHostConfig(iface, peerRepo.list(), { removePublicKeys: options.removePublicKeys });
    }
    if (server.enabled) {
      const backend = await getBackend();
      await backend.sync(server, peerRepo.list());
    }
  } catch (error) {
    if (rollback) rollback();
    throw error;
  }
}

export interface CreatePeerInput {
  name: string;
  usePresharedKey?: boolean;
  allowedIps?: string;
  persistentKeepalive?: number;
  notes?: string;
}

export async function createPeer(input: CreatePeerInput): Promise<Peer> {
  const server = serverRepo.get();
  if (!server) throw new Error('Server config not initialised');

  const existing = peerRepo.list();
  const ip = nextFreeHostIp(
    server.subnet,
    existing.map((p) => p.address),
  );
  const { privateKey, publicKey } = await generateKeyPair();
  const presharedKey = input.usePresharedKey ? await generatePresharedKey() : null;

  // The peer's own tunnel address must always be part of its server-side
  // AllowedIPs, otherwise WireGuard silently drops all of its traffic.
  let allowedIps: string;
  try {
    allowedIps = normalizePeerAllowedIps(input.allowedIps, `${ip}/32`);
  } catch (error) {
    throw new ApiError(400, error instanceof Error ? error.message : 'Invalid AllowedIPs');
  }

  const peer = peerRepo.insert({
    name: input.name,
    publicKey,
    privateKey,
    presharedKey,
    address: `${ip}/32`,
    allowedIps,
    persistentKeepalive: input.persistentKeepalive ?? server.persistentKeepalive,
    enabled: true,
    notes: input.notes ?? null,
  });

  await applyMutation(() => peerRepo.delete(peer.id));
  return peer;
}

export async function updatePeer(
  id: string,
  patch: Partial<Pick<Peer, 'name' | 'enabled' | 'allowedIps' | 'persistentKeepalive' | 'notes'>>,
): Promise<Peer> {
  const before = peerRepo.get(id);
  if (!before) throw notFound('Peer not found');
  const next = { ...patch };
  if (next.allowedIps !== undefined) {
    try {
      next.allowedIps = normalizePeerAllowedIps(next.allowedIps, before.address);
    } catch (error) {
      throw new ApiError(400, error instanceof Error ? error.message : 'Invalid AllowedIPs');
    }
  }
  const peer = peerRepo.update(id, next);
  await applyMutation(() => peerRepo.restore(before));
  return peer;
}

export async function deletePeer(id: string): Promise<void> {
  const before = peerRepo.get(id);
  if (!before) throw notFound('Peer not found');
  peerRepo.delete(id);
  await applyMutation(() => peerRepo.restore(before), { removePublicKeys: [before.publicKey] });
}

export async function regeneratePeerKeys(id: string): Promise<Peer> {
  const existing = peerRepo.get(id);
  if (!existing) throw notFound('Peer not found');
  const server = serverRepo.get();
  const writeThroughEnabled = Boolean(
    server?.managedExternally && server.writeThrough && hostWritable(config.env.WG_INTERFACE),
  );
  if (!existing.privateKey && !writeThroughEnabled) {
    throw new ApiError(
      400,
      'Cannot regenerate keys for a peer imported from an external interface. ' +
        'Enable write-through in Settings, or manage this peer directly on the host.',
    );
  }
  const { privateKey, publicKey } = await generateKeyPair();
  const peer = peerRepo.update(id, { privateKey, publicKey });
  await applyMutation(() => peerRepo.restore(existing));
  return peer;
}

export function getPeerConfig(id: string): { peer: Peer; config: string } {
  const server = serverRepo.get();
  const peer = peerRepo.get(id);
  if (!server || !peer) throw notFound('Peer not found');
  if (!peer.privateKey) {
    throw new ApiError(
      400,
      'This peer was imported from an external interface, so its private key is not available. ' +
        'Use "Recreate with new keys" to make it exportable.',
    );
  }
  return { peer, config: generateClientConfig(server, peer) };
}

export async function getPeerQrPng(id: string): Promise<Buffer> {
  const { config } = getPeerConfig(id);
  return QRCode.toBuffer(config, { type: 'png', width: 512, margin: 2 });
}

export async function listPeerViews(): Promise<PeerView[]> {
  const [peers, status] = await Promise.all([Promise.resolve(peerRepo.list()), getInterfaceStatus()]);
  const byKey = new Map(status.peers.map((p) => [p.publicKey, p]));
  const server = serverRepo.get();
  return peers.map((peer) => {
    const hasPrivateKey = Boolean(peer.privateKey);
    return {
      ...peer,
      status: byKey.get(peer.publicKey) ?? null,
      config: server && hasPrivateKey ? generateClientConfig(server, peer) : '',
      hasPrivateKey,
    };
  });
}
