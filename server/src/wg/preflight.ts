import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config';
import { commandExists, isWgAvailable, run } from './binary';

export type KernelSupport = 'builtin' | 'loaded' | 'missing' | 'unknown';
export type UserspaceImpl = 'wireguard-go' | 'boringtun' | null;

export interface PreflightResult {
  tools: boolean;
  kernel: KernelSupport;
  userspace: UserspaceImpl;
  hostDir: string;
  hostConfigs: string[];
}

function readProcModules(): string {
  try {
    return fs.readFileSync('/proc/modules', 'utf8');
  } catch {
    return '';
  }
}

export async function detectKernelSupport(): Promise<KernelSupport> {
  const sysPresent = fs.existsSync('/sys/module/wireguard');
  const inProc = /\bwireguard\b/.test(readProcModules());
  if (sysPresent && inProc) return 'loaded';
  if (sysPresent) return 'builtin';

  if (!(await commandExists('modprobe'))) return 'unknown';
  try {
    await run('modprobe', ['wireguard'], { timeoutMs: 8000 });
  } catch {
    // ignore, checked below
  }
  if (fs.existsSync('/sys/module/wireguard')) return 'loaded';
  return 'missing';
}

export async function detectUserspace(): Promise<UserspaceImpl> {
  if (await commandExists('wireguard-go')) return 'wireguard-go';
  if (await commandExists('boringtun')) return 'boringtun';
  return null;
}

export function listHostConfigs(): string[] {
  try {
    return fs
      .readdirSync(config.hostWgDir)
      .filter((file) => file.endsWith('.conf'))
      .map((file) => path.basename(file, '.conf'))
      .sort();
  } catch {
    return [];
  }
}

export async function getPreflight(): Promise<PreflightResult> {
  const [tools, kernel, userspace] = await Promise.all([
    isWgAvailable(),
    detectKernelSupport(),
    detectUserspace(),
  ]);
  return {
    tools,
    kernel,
    userspace,
    hostDir: config.hostWgDir,
    hostConfigs: listHostConfigs(),
  };
}

let preflightCache: PreflightResult | null = null;

export async function getPreflightCached(): Promise<PreflightResult> {
  if (preflightCache) return preflightCache;
  preflightCache = await getPreflight();
  return preflightCache;
}

export function resetPreflightCache(): void {
  preflightCache = null;
}

/**
 * When the kernel has no WireGuard support but a userspace implementation is
 * available and the fallback is enabled, returns the implementation to use.
 */
export function userspaceImplementation(
  kernel: KernelSupport,
  userspace: UserspaceImpl,
): UserspaceImpl {
  if (kernel === 'builtin' || kernel === 'loaded') return null;
  if (!config.env.WG_USERSPACE_FALLBACK) return null;
  return userspace;
}
