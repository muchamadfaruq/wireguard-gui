export interface ServerConfig {
  id: number;
  privateKey: string;
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

export interface ClientConfig {
  id: string;
  name: string;
  filename: string;
  content: string;
  createdAt: string;
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

export interface PeerView extends Peer {
  status: PeerRuntimeStatus | null;
  config: string;
  hasPrivateKey: boolean;
}

export interface PreflightInfo {
  tools: boolean;
  kernel: 'builtin' | 'loaded' | 'missing' | 'unknown';
  userspace: 'wireguard-go' | 'boringtun' | null;
  hostDir: string;
  hostConfigs: string[];
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

export interface ParsedWireGuardConfig {
  interface: {
    privateKey?: string;
    address?: string;
    dns?: string;
    mtu?: number;
    listenPort?: number;
  };
  peers: Array<{
    publicKey?: string;
    presharedKey?: string;
    endpoint?: string;
    allowedIps?: string;
    persistentKeepalive?: number;
  }>;
}
