export interface User {
  id: string;
  username: string;
  createdAt: string;
}

export interface ServerConfigView {
  id: number;
  publicKey: string;
  address: string;
  subnet: string;
  listenPort: number;
  mtu: number;
  dns: string;
  endpoint: string;
  allowedIps: string;
  persistentKeepalive: number;
  enabled: boolean;
  managedExternally: boolean;
  writeThrough: boolean;
}

export interface PeerRuntimeStatus {
  publicKey: string;
  endpoint: string | null;
  allowedIps: string | null;
  latestHandshake: number | null;
  transferRx: number;
  transferTx: number;
  persistentKeepalive: number | null;
  online: boolean;
}

export interface InterfaceStatus {
  enabled: boolean;
  running: boolean;
  interface: string;
  address: string;
  subnet: string;
  listenPort: number;
  publicKey: string;
  endpoint: string;
  dns: string;
  allowedIps: string;
  mtu: number;
  persistentKeepalive: number;
  backend: 'real' | 'mock';
  wgAvailable: boolean;
  managedExternally: boolean;
  writeThrough: boolean;
  hostWritable: boolean;
  preflight: PreflightInfo;
  peerCount: number;
  onlinePeers: number;
  peers: PeerRuntimeStatus[];
}

export interface PreflightInfo {
  tools: boolean;
  kernel: 'builtin' | 'loaded' | 'missing' | 'unknown';
  userspace: 'wireguard-go' | 'boringtun' | null;
  hostDir: string;
  hostConfigs: string[];
}

export interface Peer {
  id: string;
  name: string;
  publicKey: string;
  privateKey: string;
  presharedKey: string | null;
  address: string;
  allowedIps: string;
  persistentKeepalive: number;
  enabled: boolean;
  createdAt: string;
  notes: string | null;
}

export interface PeerView extends Peer {
  status: PeerRuntimeStatus | null;
  config: string;
  hasPrivateKey: boolean;
}

export interface ClientConfig {
  id: string;
  name: string;
  filename: string;
  content: string;
  createdAt: string;
}

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
  mode?: 'fresh' | 'adopt';
  adoptInterface?: string;
  writeThrough?: boolean;
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

export class ApiError extends Error {
  status: number;
  issues?: Array<{ path: string; message: string }>;

  constructor(message: string, status: number, issues?: Array<{ path: string; message: string }>) {
    super(message);
    this.status = status;
    this.issues = issues;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    credentials: 'include',
    ...options,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      (isJson && body && typeof body === 'object' && 'error' in body && String(body.error)) ||
      (typeof body === 'string' && body) ||
      `Request failed (${response.status})`;
    const issues =
      isJson && body && typeof body === 'object' && 'issues' in body
        ? (body.issues as Array<{ path: string; message: string }>)
        : undefined;
    throw new ApiError(message, response.status, issues);
  }

  return body as T;
}

function jsonRequest<T>(path: string, method: string, data?: unknown): Promise<T> {
  const init: RequestInit = { method };
  if (data !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(data);
  }
  return request<T>(path, init);
}

export const api = {
  // setup
  getSetupStatus: () => request<SetupStatus>('/setup/status'),
  detectEndpoint: () => request<{ endpoint: string | null }>('/setup/detect-endpoint'),
  submitSetup: (input: SetupInput) =>
    jsonRequest<{ user: User; warning?: string; server: ServerConfigView }>('/setup', 'POST', input),

  // auth
  login: (username: string, password: string) =>
    jsonRequest<{ user: User }>('/auth/login', 'POST', { username, password }),
  logout: () => jsonRequest<{ ok: boolean }>('/auth/logout', 'POST'),
  me: () => request<{ user: User }>('/auth/me'),
  changePassword: (currentPassword: string, newPassword: string) =>
    jsonRequest<{ ok: boolean }>('/auth/password', 'POST', { currentPassword, newPassword }),

  // server
  getServerConfig: () => request<ServerConfigView>('/server/config'),
  getStatus: () => request<InterfaceStatus>('/server/status'),
  updateServerConfig: (patch: Partial<ServerConfigView>) =>
    jsonRequest<ServerConfigView>('/server/config', 'PATCH', patch),
  serverUp: () => jsonRequest<InterfaceStatus>('/server/up', 'POST'),
  serverDown: () => jsonRequest<InterfaceStatus>('/server/down', 'POST'),
  serverRestart: () => jsonRequest<InterfaceStatus>('/server/restart', 'POST'),
  serverReapply: () => jsonRequest<InterfaceStatus>('/server/reapply', 'POST'),

  // peers
  listPeers: () => request<PeerView[]>('/peers'),
  createPeer: (input: {
    name: string;
    usePresharedKey?: boolean;
    allowedIps?: string;
    persistentKeepalive?: number;
    notes?: string;
  }) => jsonRequest<Peer>('/peers', 'POST', input),
  updatePeer: (id: string, patch: Partial<Peer>) =>
    jsonRequest<Peer>(`/peers/${id}`, 'PATCH', patch),
  deletePeer: (id: string) => jsonRequest<void>(`/peers/${id}`, 'DELETE'),
  regeneratePeer: (id: string) => jsonRequest<Peer>(`/peers/${id}/regenerate`, 'POST'),

  // client configs
  listClients: () => request<ClientConfig[]>('/clients'),
  uploadClient: (file: File, name?: string) => {
    const form = new FormData();
    form.append('file', file);
    if (name) form.append('name', name);
    return request<ClientConfig>('/clients', { method: 'POST', body: form });
  },
  deleteClient: (id: string) => jsonRequest<void>(`/clients/${id}`, 'DELETE'),

  // backup
  restoreBackup: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<{ restoredAt: string; peerCount: number; serverEnabled: boolean; warning?: string }>(
      '/backup/restore',
      { method: 'POST', body: form },
    );
  },
};

export function downloadUrl(path: string): string {
  return `/api${path}`;
}
