import { randomUUID, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { getDb } from '../db';
import { config } from '../config';

export interface User {
  id: string;
  username: string;
  createdAt: string;
}

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
}

export function isInitialized(): boolean {
  const row = getDb().prepare('SELECT COUNT(*) AS count FROM users').get() as { count: number };
  return row.count > 0;
}

export function createAdmin(username: string, password: string): User {
  const db = getDb();
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)').run(
    id,
    username,
    hash,
    createdAt,
  );
  return { id, username, createdAt };
}

/**
 * Headless bootstrap: only runs when ADMIN_PASSWORD is explicitly provided via
 * environment. Otherwise the first-run setup wizard creates the admin account.
 */
export function ensureBootstrapUser(): void {
  if (!config.env.ADMIN_PASSWORD) return;
  if (isInitialized()) return;
  createAdmin(config.env.ADMIN_USERNAME || 'admin', config.env.ADMIN_PASSWORD);
}

export function verifyCredentials(username: string, password: string): User | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as
    | UserRow
    | undefined;
  if (!row) return null;
  if (!bcrypt.compareSync(password, row.password_hash)) return null;
  return { id: row.id, username: row.username, createdAt: row.created_at };
}

export function createSession(userId: string): { token: string; expiresAt: string } {
  const db = getDb();
  const token = randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS).toISOString();
  db.prepare(
    'INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)',
  ).run(token, userId, now.toISOString(), expiresAt);
  return { token, expiresAt };
}

export function getSessionUser(token: string): User | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT u.id AS id, u.username AS username, u.created_at AS created_at, s.expires_at AS expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?`,
    )
    .get(token) as (UserRow & { expires_at: string }) | undefined;
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    deleteSession(token);
    return null;
  }
  return { id: row.id, username: row.username, createdAt: row.created_at };
}

export function deleteSession(token: string): void {
  getDb().prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function changePassword(userId: string, currentPassword: string, newPassword: string): boolean {
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as UserRow | undefined;
  if (!row) return false;
  if (!bcrypt.compareSync(currentPassword, row.password_hash)) return false;
  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, userId);
  return true;
}

export function purgeExpiredSessions(): void {
  getDb().prepare('DELETE FROM sessions WHERE expires_at < ?').run(new Date().toISOString());
}
