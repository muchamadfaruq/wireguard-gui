import { config } from '../config';
import { peerRepo, serverRepo } from '../db/repositories';
import type { InterfaceStatus, ServerConfig } from '../types';
import { isWgAvailable } from '../wg/binary';
import { getBackend } from '../wg/backend';
import { getPreflightCached } from '../wg/preflight';
import { hostWritable, writeHostConfig } from '../wg/host-sync';
import { generateKeyPair } from '../wg/keys';
import { isAddressInSubnet, isValidIpv4Cidr, serverAddressFromCidr } from '../utils/ip';
import { ApiError } from '../utils/http-error';

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

/** Interface properties owned by the host in adopt mode (not editable). */
const HOST_OWNED_FIELDS = ['address', 'subnet', 'listenPort', 'mtu'] as const;

export async function updateServerConfig(
  patch: Partial<Omit<ServerConfig, 'id' | 'privateKey' | 'publicKey' | 'enabled'>>,
): Promise<ServerConfig> {
  const before = serverRepo.get();
  if (!before) throw new Error('Server config not initialised');

  if (before.managedExternally) {
    for (const key of HOST_OWNED_FIELDS) {
      if (patch[key] !== undefined && patch[key] !== before[key]) {
        throw new ApiError(
          409,
          `"${key}" is owned by the host interface and cannot be changed in adopt mode`,
        );
      }
    }
  }

  if (patch.subnet !== undefined && !isValidIpv4Cidr(patch.subnet)) {
    throw new ApiError(400, `Invalid subnet: ${patch.subnet}`);
  }
  if (patch.address !== undefined && !isValidIpv4Cidr(patch.address)) {
    throw new ApiError(400, `Invalid address: ${patch.address}`);
  }

  // Keep the server address inside the (possibly new) subnet. When the subnet
  // changes without the address being edited, derive a valid one automatically.
  const nextSubnet = patch.subnet ?? before.subnet;
  let nextAddress = patch.address ?? before.address;
  if (!isAddressInSubnet(nextAddress, nextSubnet)) {
    if (patch.address === undefined || patch.address === before.address) {
      nextAddress = serverAddressFromCidr(nextSubnet);
    } else {
      throw new ApiError(
        400,
        `Server address ${nextAddress} is not inside subnet ${nextSubnet}`,
      );
    }
  }

  const applied: Partial<Omit<ServerConfig, 'id' | 'privateKey' | 'publicKey' | 'enabled'>> = {
    ...patch,
  };
  if (nextAddress !== (patch.address ?? before.address)) applied.address = nextAddress;

  const peers = peerRepo.list();
  const backend = await getBackend();
  // Changing the interface address, its subnet or the MTU cannot be applied with
  // `wg syncconf` (that only touches peers/keys/port), so the interface must be
  // rebuilt. Everything else can be synced live.
  const addressChanged = applied.address !== undefined && applied.address !== before.address;
  const subnetChanged = patch.subnet !== undefined && patch.subnet !== before.subnet;
  const mtuChanged = patch.mtu !== undefined && patch.mtu !== before.mtu;
  const needsRestart = !before.managedExternally && (addressChanged || subnetChanged || mtuChanged);

  let updated: ServerConfig;
  let restarted = false;
  try {
    updated = serverRepo.update(applied);
    if (updated.managedExternally && updated.writeThrough && hostWritable(config.env.WG_INTERFACE)) {
      writeHostConfig(config.env.WG_INTERFACE, peers);
    }
    if (updated.enabled) {
      if (needsRestart) {
        restarted = true;
        await backend.down(updated);
        await backend.up(updated, peers);
      } else {
        await backend.sync(updated, peers);
      }
    }
  } catch (error) {
    serverRepo.update(before);
    if (restarted) {
      // Best effort: bring the interface back with the previous configuration.
      try {
        await backend.up(before, peers);
      } catch {
        // ignore — the original error is more useful
      }
    }
    throw error;
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

/**
 * Brings the interface up on startup when it is marked enabled. Without this a
 * host reboot (or a container restart after the interface is gone) would leave
 * an "enabled" server offline until the user toggles it manually.
 */
export async function restoreEnabledInterface(): Promise<void> {
  const server = serverRepo.get();
  if (!server || !server.enabled || server.managedExternally) return;
  const backend = await getBackend();
  const peers = peerRepo.list();
  await backend.up(server, peers);
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
