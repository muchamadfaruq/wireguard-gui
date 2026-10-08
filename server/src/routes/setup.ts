import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { SESSION_COOKIE, sessionCookieOptions } from '../auth/cookie';
import { createSession } from '../services/auth-service';
import { getSetupStatus, runSetup } from '../services/setup-service';
import { getServerConfigView } from '../services/server-service';
import { detectPublicIpv4 } from '../utils/public-ip';

const setupSchema = z.object({
  mode: z.enum(['fresh', 'adopt']).optional(),
  adoptInterface: z.string().optional(),
  writeThrough: z.boolean().optional(),
  username: z.string().min(1).max(64),
  password: z.string().min(6),
  endpoint: z.string().optional(),
  subnet: z.string().regex(/^[0-9.]+\/\d{1,2}$/).optional(),
  listenPort: z.number().int().min(1).max(65535).optional(),
  dns: z.string().optional(),
  allowedIps: z.string().optional(),
  mtu: z.number().int().min(576).max(9000).optional(),
  persistentKeepalive: z.number().int().min(0).max(3600).optional(),
  useFullTunnel: z.boolean().optional(),
  startInterface: z.boolean().optional(),
  token: z.string().optional(),
});

const rateLimit = { max: 10, timeWindow: '1 minute' };

export async function setupRoutes(app: FastifyInstance): Promise<void> {
  app.get('/status', async () => getSetupStatus());

  app.get('/detect-endpoint', { config: { rateLimit } }, async () => {
    const endpoint = await detectPublicIpv4();
    return { endpoint };
  });

  app.post('/', { config: { rateLimit } }, async (req, reply) => {
    const input = setupSchema.parse(req.body);
    const { user, warning } = await runSetup(input);
    const { token } = createSession(user.id);
    reply.setCookie(SESSION_COOKIE, token, sessionCookieOptions());
    return { user, warning, server: getServerConfigView() };
  });
}
