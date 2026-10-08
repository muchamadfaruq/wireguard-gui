import { config } from '../config';
import { peerRepo, serverRepo } from '../db/repositories';
import type { InterfaceStatus, ServerConfig } from '../types';
import { isWgAvailable } from '../wg/binary';
import { getBackend } from '../wg/backend';
import { getPreflightCached } from '../wg/preflight';
import { hostWritable, writeHostConfig } from '../wg/host-sync';
import { generateKeyPair } from '../wg/keys';
import { serverAddressFromCidr } from '../utils/ip';

export async function bootstrapServerConfig(): Promise<void> {
  if (serverRepo.get()) return;
  const { privateKey, publicKey } = await generateKeyPair();
  serverRepo.insert({
    privateKey,
    publicKey,
    address: serverAddressFromCidr(config.env.WG_SUBNET),
    subnet: config.env.WG_SUBNET,
    listenPort: config.env.WG_PORT,
    mtu: config.env.WG_MTU,
    dns: config.env.WG_DNS,
    endpoint: config.env.WG_ENDPOINT === 'auto' ? '' : config.env.WG_ENDPOINT,
    allowedIps: config.env.WG_ALLOWED_IPS,
    persistentKeepalive: config.env.WG_PERSISTENT_KEEPALIVE,
    enabled: false,
    managedExternally: false,
    writeThrough: false,
  });
}

export function getServerConfig(): ServerConfig {
  const server = serverRepo.get();
  if (!server) throw new Error('Server config not initialised');
  return server;
}

export function getServerConfigView(): Omit<ServerConfig, 'privateKey'> {
  const { privateKey: _privateKey, ...view } = getServerConfig();
  return view;
}

export async function updateServerConfig(
  patch: Partial<Omit<ServerConfig, 'id' | 'privateKey' | 'publicKey' | 'enabled'>>,
): Promise<ServerConfig> {
  const updated = serverRepo.update(patch);
  const backend = await getBackend();
  const peers = peerRepo.list();
  if (updated.managedExternally && updated.writeThrough && hostWritable(config.env.WG_INTERFACE)) {
    writeHostConfig(config.env.WG_INTERFACE, peers);
  }
  if (updated.enabled) {
    await backend.sync(updated, peers);
  }
  return updated;
}

/** Re-applies the current database state to the host file and live interface. */
export async function reapplyServer(): Promise<void> {
  const server = getServerConfig();
  const peers = peerRepo.list();
  if (server.managedExternally && server.writeThrough && hostWritable(config.env.WG_INTERFACE)) {
    writeHostConfig(config.env.WG_INTERFACE, peers);
  }
  if (server.enabled) {
    const backend = await getBackend();
    await backend.sync(server, peers);
  }
}

export async function setServerEnabled(enabled: boolean): Promise<void> {
  const server = getServerConfig();
  const backend = await getBackend();
  const peers = peerRepo.list();
  if (enabled) {
    await backend.up(server, peers);
  } else {
    await backend.down(server);
  }
  serverRepo.update({ enabled });
}

export async function restartServer(): Promise<void> {
  const server = getServerConfig();
  const backend = await getBackend();
  const peers = peerRepo.list();
  await backend.down(server);
  await backend.up(server, peers);
  serverRepo.update({ enabled: true });
}

export async function getInterfaceStatus(): Promise<InterfaceStatus> {
  const server = getServerConfig();
  const peers = peerRepo.list();
  const backend = await getBackend();
  const available = await isWgAvailable();
  const preflight = await getPreflightCached();
  const status = await backend.status(server, peers);

  const statusByKey = new Map(status.peers.map((p) => [p.publicKey, p]));
  const peerStatuses = peers
    .filter((p) => p.enabled)
    .map((p) => {
      const runtime = statusByKey.get(p.publicKey);
      return (
        runtime ?? {
          publicKey: p.publicKey,
          endpoint: null,
          allowedIps: p.allowedIps,
          latestHandshake: null,
          transferRx: 0,
          transferTx: 0,
          persistentKeepalive: p.persistentKeepalive || null,
          online: false,
        }
      );
    });

  return {
    enabled: server.enabled,
    running: status.running,
    interface: config.env.WG_INTERFACE,
    address: server.address,
    subnet: server.subnet,
    listenPort: server.listenPort,
    publicKey: server.publicKey,
    endpoint: server.endpoint,
    dns: server.dns,
    allowedIps: server.allowedIps,
    mtu: server.mtu,
    persistentKeepalive: server.persistentKeepalive,
    backend: backend.kind,
    wgAvailable: available,
    managedExternally: server.managedExternally,
    writeThrough: server.writeThrough,
    hostWritable: hostWritable(config.env.WG_INTERFACE),
    preflight,
    peerCount: peers.filter((p) => p.enabled).length,
    onlinePeers: peerStatuses.filter((p) => p.online).length,
    peers: peerStatuses,
  };
}
