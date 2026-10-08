import { config } from '../config';
import { serverRepo } from '../db/repositories';
import type { PreflightInfo, ServerConfig } from '../types';
import { isWgAvailable } from '../wg/binary';
import { getBackend } from '../wg/backend';
import { adoptHostConfig, getHostConfigSummary } from '../wg/adopt';
import { getPreflightCached, listHostConfigs } from '../wg/preflight';
import { isValidIpv4Cidr, serverAddressFromCidr } from '../utils/ip';
import { ApiError } from '../utils/http-error';
import { createAdmin, isInitialized, type User } from './auth-service';
import { getServerConfig, setServerEnabled, updateServerConfig } from './server-service';

export type SetupMode = 'fresh' | 'adopt';

export interface HostConfigInfo {
  interface: string;
  address: string | null;
  listenPort: number | null;
  peerCount: number;
}

export interface SetupStatus {
  initialized: boolean;
  backend: 'real' | 'mock';
  wgAvailable: boolean;
  interface: string;
  requiresToken: boolean;
  preflight: PreflightInfo;
  hostConfigs: HostConfigInfo[];
  defaults: {
    username: string;
    endpoint: string;
    subnet: string;
    listenPort: number;
    dns: string;
    allowedIps: string;
    mtu: number;
    persistentKeepalive: number;
  };
}

export interface SetupInput {
  mode?: SetupMode;
  adoptInterface?: string;
  username: string;
  password: string;
  endpoint?: string;
  subnet?: string;
  listenPort?: number;
  dns?: string;
  allowedIps?: string;
  mtu?: number;
  persistentKeepalive?: number;
  useFullTunnel?: boolean;
  startInterface?: boolean;
  token?: string;
}

export interface SetupResult {
  user: User;
  server: ServerConfig;
  warning?: string;
}

export async function getSetupStatus(): Promise<SetupStatus> {
  const backend = await getBackend();
  const available = await isWgAvailable();
  const preflight = await getPreflightCached();
  const server = serverRepo.get();
  const hostConfigs: HostConfigInfo[] = listHostConfigs().map((iface) => {
    const summary = getHostConfigSummary(iface);
    return {
      interface: summary.interface,
      address: summary.address,
      listenPort: summary.listenPort,
      peerCount: summary.peerCount,
    };
  });

  return {
    initialized: isInitialized(),
    backend: backend.kind,
    wgAvailable: available,
    interface: config.env.WG_INTERFACE,
    requiresToken: Boolean(config.env.SETUP_TOKEN),
    preflight,
    hostConfigs,
    defaults: {
      username: config.env.ADMIN_USERNAME || 'admin',
      endpoint: server?.endpoint || (config.env.WG_ENDPOINT === 'auto' ? '' : config.env.WG_ENDPOINT),
      subnet: server?.subnet || config.env.WG_SUBNET,
      listenPort: server?.listenPort || config.env.WG_PORT,
      dns: server?.dns || config.env.WG_DNS,
      allowedIps: server?.allowedIps || config.env.WG_ALLOWED_IPS,
      mtu: server?.mtu || config.env.WG_MTU,
      persistentKeepalive: server?.persistentKeepalive ?? config.env.WG_PERSISTENT_KEEPALIVE,
    },
  };
}

export async function runSetup(input: SetupInput): Promise<SetupResult> {
  if (isInitialized()) {
    throw new ApiError(409, 'This instance has already been set up');
  }
  if (config.env.SETUP_TOKEN && input.token !== config.env.SETUP_TOKEN) {
    throw new ApiError(403, 'Invalid setup token');
  }

  const mode: SetupMode = input.mode === 'adopt' ? 'adopt' : 'fresh';
  let warning: string | undefined;

  if (mode === 'adopt') {
    const iface = (input.adoptInterface || config.env.WG_INTERFACE).trim();
    // Adopt before creating the admin so a failure does not leave the instance
    // in a half-initialised state.
    await adoptHostConfig(iface);
    if (input.endpoint !== undefined) {
      serverRepo.update({ endpoint: input.endpoint.trim() });
    }
  } else {
    const current = getServerConfig();
    const patch: Partial<Omit<ServerConfig, 'id' | 'privateKey' | 'publicKey' | 'enabled'>> = {};

    if (input.subnet !== undefined && input.subnet !== current.subnet) {
      if (!isValidIpv4Cidr(input.subnet)) {
        throw new ApiError(400, `Invalid subnet: ${input.subnet}`);
      }
      patch.subnet = input.subnet;
      patch.address = serverAddressFromCidr(input.subnet);
    }
    if (input.endpoint !== undefined) patch.endpoint = input.endpoint.trim();
    if (input.dns !== undefined) patch.dns = input.dns.trim();
    if (input.listenPort !== undefined) patch.listenPort = input.listenPort;
    if (input.mtu !== undefined) patch.mtu = input.mtu;
    if (input.persistentKeepalive !== undefined) {
      patch.persistentKeepalive = input.persistentKeepalive;
    }
    if (input.useFullTunnel) {
      patch.allowedIps = '0.0.0.0/0';
    } else if (input.allowedIps !== undefined) {
      patch.allowedIps = input.allowedIps.trim();
    }
    if (Object.keys(patch).length > 0) {
      await updateServerConfig(patch);
    }
  }

  const user = createAdmin(input.username.trim(), input.password);

  if (mode === 'fresh' && input.startInterface !== false) {
    try {
      await setServerEnabled(true);
    } catch (error) {
      warning = `Setup saved, but starting the interface failed: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  }

  return { user, server: getServerConfig(), warning };
}
