import { randomUUID } from 'node:crypto';
import { getDb } from './index';
import type { ClientConfig, Peer, ServerConfig } from '../types';

interface ServerRow {
  id: number;
  private_key: string;
  public_key: string;
  address: string;
  subnet: string;
  listen_port: number;
  mtu: number;
  dns: string;
  endpoint: string;
  allowed_ips: string;
  persistent_keepalive: number;
  enabled: number;
  managed_externally: number;
}

interface PeerRow {
  id: string;
  name: string;
  public_key: string;
  private_key: string;
  preshared_key: string | null;
  address: string;
  allowed_ips: string;
  persistent_keepalive: number;
  enabled: number;
  created_at: string;
  notes: string | null;
}

interface ClientRow {
  id: string;
  name: string;
  filename: string;
  content: string;
  created_at: string;
}

function mapServer(row: ServerRow): ServerConfig {
  return {
    id: row.id,
    privateKey: row.private_key,
    publicKey: row.public_key,
    address: row.address,
    subnet: row.subnet,
    listenPort: row.listen_port,
    mtu: row.mtu,
    dns: row.dns,
    endpoint: row.endpoint,
    allowedIps: row.allowed_ips,
    persistentKeepalive: row.persistent_keepalive,
    enabled: Boolean(row.enabled),
    managedExternally: Boolean(row.managed_externally),
  };
}

function mapPeer(row: PeerRow): Peer {
  return {
    id: row.id,
    name: row.name,
    publicKey: row.public_key,
    privateKey: row.private_key,
    presharedKey: row.preshared_key,
    address: row.address,
    allowedIps: row.allowed_ips,
    persistentKeepalive: row.persistent_keepalive,
    enabled: Boolean(row.enabled),
    createdAt: row.created_at,
    notes: row.notes,
  };
}

function mapClient(row: ClientRow): ClientConfig {
  return {
    id: row.id,
    name: row.name,
    filename: row.filename,
    content: row.content,
    createdAt: row.created_at,
  };
}

export const serverRepo = {
  get(): ServerConfig | null {
    const row = getDb().prepare('SELECT * FROM server WHERE id = 1').get() as ServerRow | undefined;
    return row ? mapServer(row) : null;
  },
  insert(server: Omit<ServerConfig, 'id'>): ServerConfig {
    getDb()
      .prepare(
        `INSERT INTO server (id, private_key, public_key, address, subnet, listen_port, mtu, dns,
          endpoint, allowed_ips, persistent_keepalive, enabled, managed_externally)
         VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        server.privateKey,
        server.publicKey,
        server.address,
        server.subnet,
        server.listenPort,
        server.mtu,
        server.dns,
        server.endpoint,
        server.allowedIps,
        server.persistentKeepalive,
        server.enabled ? 1 : 0,
        server.managedExternally ? 1 : 0,
      );
    return this.get()!;
  },
  update(patch: Partial<Omit<ServerConfig, 'id'>>): ServerConfig {
    const current = this.get();
    if (!current) throw new Error('Server config not initialised');
    const next = { ...current, ...patch };
    getDb()
      .prepare(
        `UPDATE server SET private_key = ?, public_key = ?, address = ?, subnet = ?, listen_port = ?,
          mtu = ?, dns = ?, endpoint = ?, allowed_ips = ?, persistent_keepalive = ?, enabled = ?,
          managed_externally = ?
         WHERE id = 1`,
      )
      .run(
        next.privateKey,
        next.publicKey,
        next.address,
        next.subnet,
        next.listenPort,
        next.mtu,
        next.dns,
        next.endpoint,
        next.allowedIps,
        next.persistentKeepalive,
        next.enabled ? 1 : 0,
        next.managedExternally ? 1 : 0,
      );
    return this.get()!;
  },
};

export const peerRepo = {
  list(): Peer[] {
    const rows = getDb().prepare('SELECT * FROM peers ORDER BY created_at ASC').all() as unknown as PeerRow[];
    return rows.map(mapPeer);
  },
  get(id: string): Peer | null {
    const row = getDb().prepare('SELECT * FROM peers WHERE id = ?').get(id) as PeerRow | undefined;
    return row ? mapPeer(row) : null;
  },
  insert(peer: Omit<Peer, 'id' | 'createdAt'>): Peer {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    getDb()
      .prepare(
        `INSERT INTO peers (id, name, public_key, private_key, preshared_key, address, allowed_ips,
          persistent_keepalive, enabled, created_at, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        id,
        peer.name,
        peer.publicKey,
        peer.privateKey,
        peer.presharedKey,
        peer.address,
        peer.allowedIps,
        peer.persistentKeepalive,
        peer.enabled ? 1 : 0,
        createdAt,
        peer.notes,
      );
    return this.get(id)!;
  },
  update(id: string, patch: Partial<Omit<Peer, 'id' | 'createdAt'>>): Peer {
    const current = this.get(id);
    if (!current) throw new Error('Peer not found');
    const next = { ...current, ...patch };
    getDb()
      .prepare(
        `UPDATE peers SET name = ?, public_key = ?, private_key = ?, preshared_key = ?, address = ?,
          allowed_ips = ?, persistent_keepalive = ?, enabled = ?, notes = ? WHERE id = ?`,
      )
      .run(
        next.name,
        next.publicKey,
        next.privateKey,
        next.presharedKey,
        next.address,
        next.allowedIps,
        next.persistentKeepalive,
        next.enabled ? 1 : 0,
        next.notes,
        id,
      );
    return this.get(id)!;
  },
  delete(id: string): void {
    getDb().prepare('DELETE FROM peers WHERE id = ?').run(id);
  },
};

export const clientRepo = {
  list(): ClientConfig[] {
    const rows = getDb()
      .prepare('SELECT * FROM client_configs ORDER BY created_at DESC')
      .all() as unknown as ClientRow[];
    return rows.map(mapClient);
  },
  get(id: string): ClientConfig | null {
    const row = getDb().prepare('SELECT * FROM client_configs WHERE id = ?').get(id) as
      | ClientRow
      | undefined;
    return row ? mapClient(row) : null;
  },
  insert(config_: Omit<ClientConfig, 'id' | 'createdAt'>): ClientConfig {
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    getDb()
      .prepare(
        'INSERT INTO client_configs (id, name, filename, content, created_at) VALUES (?, ?, ?, ?, ?)',
      )
      .run(id, config_.name, config_.filename, config_.content, createdAt);
    return this.get(id)!;
  },
  delete(id: string): void {
    getDb().prepare('DELETE FROM client_configs WHERE id = ?').run(id);
  },
};
