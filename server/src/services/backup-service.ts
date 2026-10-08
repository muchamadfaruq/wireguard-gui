import AdmZip from 'adm-zip';
import fs from 'node:fs';
import path from 'node:path';
import { config, ensureDataDirs } from '../config';
import { getDb, initDb, removeDbFiles } from '../db';
import { peerRepo, serverRepo } from '../db/repositories';
import { ensureBootstrapUser } from './auth-service';
import { restartServer } from './server-service';

const BACKUP_VERSION = 1;

export interface BackupResult {
  filename: string;
  buffer: Buffer;
}

export function createBackup(): BackupResult {
  ensureDataDirs();
  getDb().exec('PRAGMA wal_checkpoint(TRUNCATE);');
  const zip = new AdmZip();
  const server = serverRepo.get();
  const manifest = {
    app: 'wireguard-gui',
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    serverPublicKey: server?.publicKey ?? null,
  };
  zip.addFile('manifest.json', Buffer.from(JSON.stringify(manifest, null, 2), 'utf8'));
  zip.addFile('wg.db', fs.readFileSync(config.dbFile));
  if (fs.existsSync(config.configsDir)) {
    zip.addLocalFolder(config.configsDir, 'configs');
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return {
    filename: `wireguard-gui-backup-${stamp}.zip`,
    buffer: zip.toBuffer(),
  };
}

export async function restoreBackup(
  buffer: Buffer,
  options: { restart?: boolean } = {},
): Promise<{ restoredAt: string; peerCount: number; serverEnabled: boolean; warning?: string }> {
  const zip = new AdmZip(buffer);
  const manifestEntry = zip.getEntry('manifest.json');
  const dbEntry = zip.getEntry('wg.db');
  if (!manifestEntry || !dbEntry) {
    throw new Error('Invalid backup: missing manifest.json or wg.db');
  }

  let manifest: { app?: string; version?: number };
  try {
    manifest = JSON.parse(zip.readAsText(manifestEntry));
  } catch {
    throw new Error('Invalid backup: manifest.json is not valid JSON');
  }
  if (manifest.app !== 'wireguard-gui') {
    throw new Error('Invalid backup: not a WireGuard GUI backup');
  }
  if (typeof manifest.version !== 'number' || manifest.version > BACKUP_VERSION) {
    throw new Error('Unsupported backup version');
  }

  ensureDataDirs();
  const tmp = fs.mkdtempSync(path.join(config.dataDir, 'restore-'));
  try {
    zip.extractAllTo(tmp, true);
    const newDb = path.join(tmp, 'wg.db');
    if (!fs.existsSync(newDb)) throw new Error('Invalid backup: wg.db missing after extraction');

    const safetyDir = path.join(config.dataDir, 'backups', new Date().toISOString().replace(/[:.]/g, '-'));
    fs.mkdirSync(safetyDir, { recursive: true });
    if (fs.existsSync(config.dbFile)) {
      fs.copyFileSync(config.dbFile, path.join(safetyDir, 'wg.db'));
    }
    if (fs.existsSync(config.configsDir)) {
      fs.cpSync(config.configsDir, path.join(safetyDir, 'configs'), { recursive: true });
    }

    removeDbFiles();
    fs.copyFileSync(newDb, config.dbFile);

    fs.rmSync(config.configsDir, { recursive: true, force: true });
    fs.mkdirSync(config.configsDir, { recursive: true });
    const extractedConfigs = path.join(tmp, 'configs');
    if (fs.existsSync(extractedConfigs)) {
      fs.cpSync(extractedConfigs, config.configsDir, { recursive: true });
    }

    initDb();
    ensureBootstrapUser();

    const server = serverRepo.get();
    let warning: string | undefined;
    if (options.restart !== false && server?.enabled) {
      try {
        await restartServer();
      } catch (error) {
        warning = `Data restored, but restarting the interface failed: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    }

    return {
      restoredAt: new Date().toISOString(),
      peerCount: peerRepo.list().length,
      serverEnabled: Boolean(server?.enabled),
      warning,
    };
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}
