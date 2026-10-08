import QRCode from 'qrcode';
import { peerRepo, serverRepo } from '../db/repositories';
import type { Peer, PeerView } from '../types';
import { getBackend } from '../wg/backend';
import { generateClientConfig } from '../wg/config';
import { generateKeyPair, generatePresharedKey } from '../wg/keys';
import { nextFreeHostIp } from '../utils/ip';
import { ApiError, notFound } from '../utils/http-error';
import { getInterfaceStatus } from './server-service';

async function syncIfEnabled(): Promise<void> {
  const server = serverRepo.get();
  if (!server || !server.enabled) return;
  const backend = await getBackend();
  await backend.sync(server, peerRepo.list());
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

  const peer = peerRepo.insert({
    name: input.name,
    publicKey,
    privateKey,
    presharedKey,
    address: `${ip}/32`,
    allowedIps: input.allowedIps?.trim() || `${ip}/32`,
    persistentKeepalive: input.persistentKeepalive ?? server.persistentKeepalive,
    enabled: true,
    notes: input.notes ?? null,
  });

  await syncIfEnabled();
  return peer;
}

export async function updatePeer(
  id: string,
  patch: Partial<Pick<Peer, 'name' | 'enabled' | 'allowedIps' | 'persistentKeepalive' | 'notes'>>,
): Promise<Peer> {
  const peer = peerRepo.update(id, patch);
  await syncIfEnabled();
  return peer;
}

export async function deletePeer(id: string): Promise<void> {
  peerRepo.delete(id);
  await syncIfEnabled();
}

export async function regeneratePeerKeys(id: string): Promise<Peer> {
  const existing = peerRepo.get(id);
  if (!existing) throw notFound('Peer not found');
  if (!existing.privateKey) {
    throw new ApiError(
      400,
      'Cannot regenerate keys for a peer imported from an external interface. ' +
        'Manage this peer directly on the host.',
    );
  }
  const { privateKey, publicKey } = await generateKeyPair();
  const peer = peerRepo.update(id, { privateKey, publicKey });
  await syncIfEnabled();
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
        'A client configuration cannot be generated for it.',
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
