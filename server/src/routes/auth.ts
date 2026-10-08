import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { SESSION_COOKIE, sessionCookieOptions } from '../auth/cookie';
import { requireAuth } from '../auth/require-auth';
import {
  changePassword,
  createSession,
  deleteSession,
  verifyCredentials,
} from '../services/auth-service';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/login',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (req, reply) => {
      const { username, password } = loginSchema.parse(req.body);
      const user = verifyCredentials(username, password);
      if (!user) {
        return reply.code(401).send({ error: 'Invalid username or password' });
      }
      const { token } = createSession(user.id);
      reply.setCookie(SESSION_COOKIE, token, sessionCookieOptions());
      return { user };
    },
  );

  app.post('/logout', async (req, reply) => {
    const token = req.cookies[SESSION_COOKIE];
    if (token) deleteSession(token);
    reply.clearCookie(SESSION_COOKIE, { path: '/' });
    return { ok: true };
  });

  app.get('/me', { preHandler: requireAuth }, async (req) => {
    return { user: req.user };
  });

  app.post('/password', { preHandler: requireAuth }, async (req, reply) => {
    const { currentPassword, newPassword } = passwordSchema.parse(req.body);
    const ok = changePassword(req.user!.id, currentPassword, newPassword);
    if (!ok) {
      return reply.code(400).send({ error: 'Current password is incorrect' });
    }
    return { ok: true };
  });
}
