import QRCode from 'qrcode';
import { clientRepo } from '../db/repositories';
import type { ClientConfig } from '../types';
import { parseWireGuardConfig } from '../wg/config';

function baseName(filename: string): string {
  return filename.replace(/\.[^.]+$/, '').trim() || 'config';
}

export function importClientConfig(input: {
  filename: string;
  content: string;
  name?: string;
}): ClientConfig {
  const content = input.content.replace(/\r\n/g, '\n').trim() + '\n';
  const parsed = parseWireGuardConfig(content);
  if (!parsed.interface.privateKey && !parsed.peers.some((p) => p.publicKey)) {
    throw new Error('File does not look like a valid WireGuard configuration');
  }
  const derivedName =
    input.name?.trim() ||
    parsed.peers[0]?.endpoint?.split(':')[0] ||
    baseName(input.filename) ||
    'imported';

  return clientRepo.insert({
    name: derivedName,
    filename: input.filename || 'wg0.conf',
    content,
  });
}

export function listClientConfigs(): ClientConfig[] {
  return clientRepo.list();
}

export function getClientConfig(id: string): ClientConfig {
  const config_ = clientRepo.get(id);
  if (!config_) throw new Error('Client config not found');
  return config_;
}

export function deleteClientConfig(id: string): void {
  clientRepo.delete(id);
}

export async function getClientQrPng(id: string): Promise<Buffer> {
  const config_ = getClientConfig(id);
  return QRCode.toBuffer(config_.content, { type: 'png', width: 512, margin: 2 });
}
