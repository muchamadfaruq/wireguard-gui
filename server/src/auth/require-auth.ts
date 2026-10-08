import type { FastifyReply, FastifyRequest } from 'fastify';
import { getSessionUser, type User } from '../services/auth-service';
import { SESSION_COOKIE } from './cookie';

export { SESSION_COOKIE };

declare module 'fastify' {
  interface FastifyRequest {
    user?: User;
  }
}

export async function requireAuth(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const token = req.cookies[SESSION_COOKIE];
  if (!token) {
    await reply.code(401).send({ error: 'Unauthorized' });
    return;
  }
  const user = getSessionUser(token);
  if (!user) {
    await reply.code(401).send({ error: 'Unauthorized' });
    return;
  }
  req.user = user;
}
