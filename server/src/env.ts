import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.string().default('development'),
  // When empty, a secret is generated and persisted to DATA_DIR/.session-secret
  SESSION_SECRET: z.string().default(''),
  COOKIE_SECURE: z
    .string()
    .default('false')
    .transform((v) => v === 'true' || v === '1'),

  // When ADMIN_PASSWORD is set, an admin is created automatically on first run
  // and the first-run setup wizard is skipped (headless/automation mode).
  ADMIN_USERNAME: z.string().default('admin'),
  ADMIN_PASSWORD: z.string().default(''),
  // Optional shared token required to run the first-run setup wizard.
  SETUP_TOKEN: z.string().default(''),

  WG_INTERFACE: z.string().default('wg0'),
  WG_SUBNET: z.string().default('10.8.0.0/24'),
  WG_PORT: z.coerce.number().int().positive().default(51820),
  WG_ENDPOINT: z.string().default('auto'),
  WG_DNS: z.string().default('1.1.1.1'),
  WG_ALLOWED_IPS: z.string().default('0.0.0.0/0'),
  WG_PERSISTENT_KEEPALIVE: z.coerce.number().int().nonnegative().default(25),
  WG_MTU: z.coerce.number().int().positive().default(1420),
  WG_EGRESS_INTERFACE: z.string().default(''),
  // Directory with existing host WireGuard configs (mount read-only).
  HOST_WG_DIR: z.string().default('/etc/wireguard'),
  // Fall back to a userspace implementation when the kernel module is missing.
  WG_USERSPACE_FALLBACK: z
    .string()
    .default('true')
    .transform((v) => !(v === 'false' || v === '0')),

  DATA_DIR: z.string().default('./data'),
  MOCK_MODE: z
    .string()
    .default('false')
    .transform((v) => v === 'true' || v === '1'),
});

export type Env = z.infer<typeof schema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${details}`);
  }
  return parsed.data;
}
