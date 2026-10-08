import path from 'node:path';
import fs from 'node:fs';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { loadEnv } from './env';

const here = path.dirname(fileURLToPath(import.meta.url));
// `here` is server/src in development and server/dist in production.
const projectRoot = path.resolve(here, '..', '..');

const env = loadEnv();

export const config = {
  env,
  projectRoot,
  dataDir: path.isAbsolute(env.DATA_DIR) ? env.DATA_DIR : path.resolve(projectRoot, env.DATA_DIR),
  get dbFile() {
    return path.join(this.dataDir, 'wg.db');
  },
  get configsDir() {
    return path.join(this.dataDir, 'configs');
  },
  get uploadsDir() {
    return path.join(this.dataDir, 'uploads');
  },
  get hostWgDir() {
    return path.isAbsolute(env.HOST_WG_DIR)
      ? env.HOST_WG_DIR
      : path.resolve(projectRoot, env.HOST_WG_DIR);
  },
  webDist: path.resolve(projectRoot, 'web', 'dist'),
};

export function ensureDataDirs(): void {
  for (const dir of [config.dataDir, config.configsDir, config.uploadsDir]) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

let cachedSessionSecret: string | null = null;

/**
 * Returns the session secret. When SESSION_SECRET is not provided it is
 * generated once and persisted to DATA_DIR/.session-secret so sessions survive
 * restarts without requiring any .env configuration.
 */
export function getSessionSecret(): string {
  if (env.SESSION_SECRET) return env.SESSION_SECRET;
  if (cachedSessionSecret) return cachedSessionSecret;
  ensureDataDirs();
  const file = path.join(config.dataDir, '.session-secret');
  try {
    if (fs.existsSync(file)) {
      const stored = fs.readFileSync(file, 'utf8').trim();
      if (stored) {
        cachedSessionSecret = stored;
        return stored;
      }
    }
  } catch {
    // fall through and regenerate
  }
  const generated = randomBytes(32).toString('hex');
  fs.writeFileSync(file, `${generated}\n`, { mode: 0o600 });
  cachedSessionSecret = generated;
  return generated;
}

export type AppConfig = typeof config;
