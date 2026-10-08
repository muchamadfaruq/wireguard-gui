import { createPrivateKey, createPublicKey, randomBytes } from 'node:crypto';
import { isWgAvailable, runWg } from './binary';

// DER headers for Curve25519 / X25519 keys (RFC 8410).
const PKCS8_X25519_PREFIX = Buffer.from('302e020100300506032b656e04220420', 'hex');
const SPKI_X25519_PREFIX = Buffer.from('302a300506032b656e032100', 'hex');

function rawPrivateToPublic(rawPrivate: Buffer): Buffer {
  const der = Buffer.concat([PKCS8_X25519_PREFIX, rawPrivate]);
  const keyObject = createPrivateKey({ key: der, format: 'der', type: 'pkcs8' });
  const publicKey = createPublicKey(keyObject);
  const spki = publicKey.export({ format: 'der', type: 'spki' }) as Buffer;
  return spki.subarray(SPKI_X25519_PREFIX.length);
}

function clampScalar(raw: Buffer): Buffer {
  const out = Buffer.from(raw);
  out[0] = (out[0]! & 248) as number;
  out[31] = ((out[31]! & 127) | 64) as number;
  return out;
}

export async function generatePrivateKey(): Promise<string> {
  if (await isWgAvailable()) {
    const result = await runWg(['genkey']);
    if (result.code === 0 && result.stdout.trim()) {
      return result.stdout.trim();
    }
  }
  return clampScalar(randomBytes(32)).toString('base64');
}

export async function derivePublicKey(privateKey: string): Promise<string> {
  if (await isWgAvailable()) {
    const result = await runWg(['pubkey'], `${privateKey}\n`);
    if (result.code === 0 && result.stdout.trim()) {
      return result.stdout.trim();
    }
  }
  return rawPrivateToPublic(Buffer.from(privateKey, 'base64')).toString('base64');
}

export async function generatePresharedKey(): Promise<string> {
  if (await isWgAvailable()) {
    const result = await runWg(['genpsk']);
    if (result.code === 0 && result.stdout.trim()) {
      return result.stdout.trim();
    }
  }
  return randomBytes(32).toString('base64');
}

export async function generateKeyPair(): Promise<{ privateKey: string; publicKey: string }> {
  const privateKey = await generatePrivateKey();
  const publicKey = await derivePublicKey(privateKey);
  return { privateKey, publicKey };
}

export const _internal = { rawPrivateToPublic, clampScalar };
