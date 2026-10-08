import { createRequire } from 'node:module';
import fs from 'node:fs';
import { config, ensureDataDirs } from '../config';

interface SqliteStatement {
  run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
  get(...params: unknown[]): unknown;
  all(...params: unknown[]): unknown[];
}

interface SqliteDatabase {
  exec(sql: string): void;
  prepare(sql: string): SqliteStatement;
  close(): void;
}

// `node:sqlite` is loaded via createRequire so the bundler cannot rewrite the
// `node:` specifier (which would break at runtime).
const nodeRequire = createRequire(import.meta.url);
const { DatabaseSync } = nodeRequire('node:sqlite') as {
  DatabaseSync: new (path: string) => SqliteDatabase;
};

let db: SqliteDatabase | null = null;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS server (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  private_key TEXT NOT NULL,
  public_key TEXT NOT NULL,
  address TEXT NOT NULL,
  subnet TEXT NOT NULL,
  listen_port INTEGER NOT NULL,
  mtu INTEGER NOT NULL,
  dns TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  allowed_ips TEXT NOT NULL,
  persistent_keepalive INTEGER NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 0,
  managed_externally INTEGER NOT NULL DEFAULT 0,
  write_through INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS peers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  public_key TEXT NOT NULL,
  private_key TEXT NOT NULL,
  preshared_key TEXT,
  address TEXT NOT NULL,
  allowed_ips TEXT NOT NULL,
  persistent_keepalive INTEGER NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS client_configs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  filename TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_peers_public_key ON peers(public_key);
`;

function tableHasColumn(database: SqliteDatabase, table: string, column: string): boolean {
  const rows = database.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  return rows.some((row) => row.name === column);
}

function runMigrations(database: SqliteDatabase): void {
  if (!tableHasColumn(database, 'server', 'managed_externally')) {
    database.exec(
      'ALTER TABLE server ADD COLUMN managed_externally INTEGER NOT NULL DEFAULT 0;',
    );
  }
  if (!tableHasColumn(database, 'server', 'write_through')) {
    database.exec('ALTER TABLE server ADD COLUMN write_through INTEGER NOT NULL DEFAULT 0;');
  }
}

export function initDb(): SqliteDatabase {
  ensureDataDirs();
  if (db) return db;
  db = new DatabaseSync(config.dbFile);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(SCHEMA);
  runMigrations(db);
  return db;
}

export function getDb(): SqliteDatabase {
  if (!db) {
    return initDb();
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export function reopenDb(): SqliteDatabase {
  closeDb();
  return initDb();
}

export function removeDbFiles(): void {
  closeDb();
  for (const suffix of ['', '-wal', '-shm']) {
    const file = `${config.dbFile}${suffix}`;
    if (fs.existsSync(file)) {
      fs.rmSync(file);
    }
  }
}
