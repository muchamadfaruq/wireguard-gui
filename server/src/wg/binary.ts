import { spawn } from 'node:child_process';
import { config } from '../config';

export interface RunResult {
  stdout: string;
  stderr: string;
  code: number;
}

export function run(
  command: string,
  args: string[],
  options: { input?: string; timeoutMs?: number; env?: NodeJS.ProcessEnv } = {},
): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: options.env ?? process.env,
    });
    let stdout = '';
    let stderr = '';
    let settled = false;

    const timer = options.timeoutMs
      ? setTimeout(() => {
          child.kill('SIGKILL');
        }, options.timeoutMs)
      : null;

    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));

    child.on('error', (err) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      reject(err);
    });

    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      resolve({ stdout, stderr, code: code ?? 0 });
    });

    if (options.input !== undefined) {
      child.stdin.write(options.input);
    }
    child.stdin.end();
  });
}

export async function commandExists(command: string): Promise<boolean> {
  try {
    const result = await run(command, ['--version'], { timeoutMs: 5000 });
    return result.code === 0 || result.stderr.length > 0 || result.stdout.length > 0;
  } catch {
    return false;
  }
}

let wgAvailableCache: boolean | null = null;

export async function isWgAvailable(): Promise<boolean> {
  if (config.env.MOCK_MODE) return false;
  if (wgAvailableCache !== null) return wgAvailableCache;
  wgAvailableCache = await commandExists('wg');
  return wgAvailableCache;
}

export function resetAvailabilityCache(): void {
  wgAvailableCache = null;
}

export async function runWg(args: string[], input?: string): Promise<RunResult> {
  return run('wg', args, { input });
}

export async function runWgQuick(args: string[], env?: NodeJS.ProcessEnv): Promise<RunResult> {
  return run('wg-quick', args, { timeoutMs: 30000, env });
}
