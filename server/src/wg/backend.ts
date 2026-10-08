import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config';
import type { Peer, PeerRuntimeStatus, ServerConfig } from '../types';
import { isWgAvailable, run, runWg, runWgQuick } from './binary';
import { generateServerConfig } from './config';
import { detectKernelSupport, detectUserspace, userspaceImplementation } from './preflight';
import { parseWgDump } from './status';
import { ApiError } from '../utils/http-error';

export interface BackendStatus {
  running: boolean;
  peers: PeerRuntimeStatus[];
}

export interface WgBackend {
  readonly kind: 'real' | 'mock';
  up(server: ServerConfig, peers: Peer[]): Promise<void>;
  down(server: ServerConfig): Promise<void>;
  sync(server: ServerConfig, peers: Peer[]): Promise<void>;
  status(server: ServerConfig, peers: Peer[]): Promise<BackendStatus>;
}

function configFilePath(iface: string): string {
  return path.join(config.configsDir, `${iface}.conf`);
}

function writeConfigFile(iface: string, contents: string): void {
  const file = configFilePath(iface);
  fs.writeFileSync(file, contents, { mode: 0o600 });
}

async function detectEgressInterface(): Promise<string> {
  if (config.env.WG_EGRESS_INTERFACE) return config.env.WG_EGRESS_INTERFACE;
  try {
    const result = await run('ip', ['route', 'show', 'default']);
    const match = result.stdout.match(/default\s+.*?\bdev\s+(\S+)/);
    if (match?.[1]) return match[1];
  } catch {
    // ignore
  }
  return 'eth0';
}

export class RealWgBackend implements WgBackend {
  readonly kind = 'real' as const;

  private async egress(): Promise<string> {
    return detectEgressInterface();
  }

  private async isRunning(iface: string): Promise<boolean> {
    const result = await runWg(['show', iface]);
    return result.code === 0;
  }

  private async currentPublicKey(iface: string): Promise<string | null> {
    const result = await runWg(['show', iface, 'public-key']);
    if (result.code !== 0) return null;
    const key = result.stdout.trim();
    return key || null;
  }

  private async ownsInterface(server: ServerConfig, iface: string): Promise<boolean> {
    const actual = await this.currentPublicKey(iface);
    return actual !== null && actual === server.publicKey;
  }

  /**
   * Prevents clobbering a pre-existing interface that this app does not own
   * (e.g. a host WireGuard service using the same interface name).
   */
  private async guardOwnership(server: ServerConfig, iface: string): Promise<void> {
    if (!(await this.isRunning(iface))) return;
    if (await this.ownsInterface(server, iface)) return;
    throw new ApiError(
      409,
      `Interface "${iface}" already exists but is not managed by this app ` +
        `(public key mismatch). Refusing to modify it. Use a different interface ` +
        `name/port or adopt it explicitly.`,
    );
  }

  private async quickEnv(): Promise<NodeJS.ProcessEnv> {
    const kernel = await detectKernelSupport();
    const impl = userspaceImplementation(kernel, await detectUserspace());
    if (impl) {
      return { ...process.env, WG_QUICK_USERSPACE_IMPLEMENTATION: impl };
    }
    return { ...process.env };
  }

  /**
   * `wg syncconf` updates the WireGuard peer table but does not touch the kernel
   * routing table (only `wg-quick up` does). Peers whose AllowedIPs are outside
   * the interface subnet would therefore be unreachable. Add any missing routes
   * so the server can actually deliver packets to every peer.
   */
  private async ensurePeerRoutes(iface: string, peers: Peer[]): Promise<void> {
    const cidrs = new Set<string>();
    for (const peer of peers) {
      if (!peer.enabled) continue;
      for (const entry of peer.allowedIps.split(',')) {
        const value = entry.trim();
        if (value) cidrs.add(value);
      }
    }
    for (const cidr of cidrs) {
      const existing = await run('ip', ['-4', 'route', 'show', 'dev', iface, 'match', cidr]);
      if (existing.code === 0 && existing.stdout.trim()) continue;
      const added = await run('ip', ['-4', 'route', 'add', cidr, 'dev', iface]);
      if (added.code !== 0 && !/file exists/i.test(added.stderr)) {
        throw new ApiError(
          500,
          `Failed to add route ${cidr} via ${iface}: ${added.stderr.trim() || added.stdout.trim()}`,
        );
      }
    }
  }

  async up(server: ServerConfig, peers: Peer[]): Promise<void> {
    const iface = config.env.WG_INTERFACE;

    if (server.managedExternally) {
      if (!(await this.isRunning(iface))) {
        throw new ApiError(
          409,
          `Interface "${iface}" is not running. It is managed externally — start it on the host.`,
        );
      }
      await this.sync(server, peers);
      return;
    }

    await this.guardOwnership(server, iface);
    const egress = await this.egress();
    writeConfigFile(iface, generateServerConfig(server, peers, egress));
    if (await this.isRunning(iface)) {
      await this.sync(server, peers);
      return;
    }

    const result = await runWgQuick(['up', configFilePath(iface)], await this.quickEnv());
    if (result.code !== 0) {
      const detail = result.stderr || result.stdout;
      const hint =
        'Is the WireGuard kernel module available (or a userspace implementation installed)?';
      throw new ApiError(500, `wg-quick up failed: ${detail || hint}`);
    }
  }

  async down(server: ServerConfig): Promise<void> {
    const iface = config.env.WG_INTERFACE;
    // The lifecycle of an adopted interface is owned by the host.
    if (server.managedExternally) return;
    if (!(await this.isRunning(iface))) return;
    if (!(await this.ownsInterface(server, iface))) return;
    const result = await runWgQuick(['down', configFilePath(iface)]);
    if (result.code !== 0) {
      throw new Error(`wg-quick down failed: ${result.stderr || result.stdout}`);
    }
  }

  async sync(server: ServerConfig, peers: Peer[]): Promise<void> {
    const iface = config.env.WG_INTERFACE;
    const egress = await this.egress();
    writeConfigFile(iface, generateServerConfig(server, peers, egress));
    if (!(await this.isRunning(iface))) return;
    if (!(await this.ownsInterface(server, iface))) {
      throw new ApiError(
        409,
        `Interface "${iface}" is not managed by this app (public key mismatch). Refusing to sync.`,
      );
    }

    const stripped = await runWgQuick(['strip', configFilePath(iface)]);
    if (stripped.code !== 0) {
      throw new Error(`wg-quick strip failed: ${stripped.stderr}`);
    }
    const tmp = path.join(config.dataDir, `.${iface}.sync.conf`);
    fs.writeFileSync(tmp, stripped.stdout, { mode: 0o600 });
    try {
      const result = await runWg(['syncconf', iface, tmp]);
      if (result.code !== 0) {
        throw new Error(`wg syncconf failed: ${result.stderr || result.stdout}`);
      }
    } finally {
      fs.rmSync(tmp, { force: true });
    }

    // The host owns routing in adopt mode; only manage routes for interfaces
    // this app created.
    if (!server.managedExternally) {
      await this.ensurePeerRoutes(iface, peers);
    }
  }

  async status(_server: ServerConfig, _peers: Peer[]): Promise<BackendStatus> {
    const iface = config.env.WG_INTERFACE;
    if (!(await this.isRunning(iface))) {
      return { running: false, peers: [] };
    }
    const result = await runWg(['show', iface, 'dump']);
    if (result.code !== 0) {
      return { running: false, peers: [] };
    }
    const dump = parseWgDump(result.stdout);
    return { running: true, peers: dump.peers };
  }
}

export class MockWgBackend implements WgBackend {
  readonly kind = 'mock' as const;
  private running = false;

  async up(server: ServerConfig, peers: Peer[]): Promise<void> {
    writeConfigFile(config.env.WG_INTERFACE, generateServerConfig(server, peers, 'eth0'));
    this.running = true;
  }

  async down(_server: ServerConfig): Promise<void> {
    this.running = false;
  }

  async sync(server: ServerConfig, peers: Peer[]): Promise<void> {
    writeConfigFile(config.env.WG_INTERFACE, generateServerConfig(server, peers, 'eth0'));
    void server;
  }

  async status(server: ServerConfig, peers: Peer[]): Promise<BackendStatus> {
    // Adopted interfaces are assumed to be running on the host.
    const isUp = this.running || server.managedExternally;
    if (!isUp) return { running: false, peers: [] };
    const now = Math.floor(Date.now() / 1000);
    const statuses: PeerRuntimeStatus[] = peers
      .filter((p) => p.enabled)
      .map((p, index) => {
        const online = index % 3 !== 2;
        return {
          publicKey: p.publicKey,
          endpoint: online ? `203.0.113.${(index % 250) + 2}:${40000 + index}` : null,
          allowedIps: p.allowedIps,
          latestHandshake: online ? now - (20 + index * 7) : null,
          transferRx: online ? 1024 * (512 + index * 333) : 0,
          transferTx: online ? 1024 * (256 + index * 111) : 0,
          persistentKeepalive: p.persistentKeepalive || null,
          online,
        };
      });
    return { running: true, peers: statuses };
  }
}

let backendInstance: WgBackend | null = null;

export async function getBackend(): Promise<WgBackend> {
  if (backendInstance) return backendInstance;
  const available = await isWgAvailable();
  backendInstance = available ? new RealWgBackend() : new MockWgBackend();
  return backendInstance;
}

export function getBackendKindSync(): 'real' | 'mock' | 'unknown' {
  return backendInstance ? backendInstance.kind : 'unknown';
}
