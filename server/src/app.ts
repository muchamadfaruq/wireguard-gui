import fs from 'node:fs';
import fastify, { type FastifyInstance } from 'fastify';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import { ZodError } from 'zod';
import { config, getSessionSecret } from './config';
import { ApiError } from './utils/http-error';
import { requireAuth } from './auth/require-auth';
import { authRoutes } from './routes/auth';
import { setupRoutes } from './routes/setup';
import { serverRoutes } from './routes/server';
import { peerRoutes } from './routes/peers';
import { clientRoutes } from './routes/clients';
import { backupRoutes } from './routes/backup';

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger: { level: config.env.NODE_ENV === 'production' ? 'info' : 'debug' },
    trustProxy: true,
    bodyLimit: 5 * 1024 * 1024,
  });

  await app.register(cookie, { secret: getSessionSecret() });
  await app.register(multipart, { limits: { fileSize: 25 * 1024 * 1024 } });
  await app.register(rateLimit, { global: false });

  app.setErrorHandler((error, req, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        error: 'Validation failed',
        issues: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    if (error instanceof ApiError) {
      return reply.code(error.statusCode).send({ error: error.message });
    }
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode && statusCode >= 400 && statusCode < 500) {
      const message = error instanceof Error ? error.message : 'Request error';
      return reply.code(statusCode).send({ error: message });
    }
    req.log.error(error);
    return reply.code(500).send({ error: 'Internal server error' });
  });

  app.get('/api/health', async () => ({ status: 'ok', mock: config.env.MOCK_MODE }));

  await app.register(
    async (api) => {
      await api.register(setupRoutes, { prefix: '/setup' });
      await api.register(authRoutes, { prefix: '/auth' });

      await api.register(async (secure) => {
        secure.addHook('onRequest', requireAuth);
        await secure.register(serverRoutes, { prefix: '/server' });
        await secure.register(peerRoutes, { prefix: '/peers' });
        await secure.register(clientRoutes, { prefix: '/clients' });
        await secure.register(backupRoutes, { prefix: '/backup' });
      });
    },
    { prefix: '/api' },
  );

  const webDistExists = fs.existsSync(config.webDist);
  if (webDistExists) {
    await app.register(fastifyStatic, { root: config.webDist, wildcard: false });
  }

  app.setNotFoundHandler((req, reply) => {
    const url = req.raw.url ?? '';
    if (url.startsWith('/api')) {
      return reply.code(404).send({ error: 'Not found' });
    }
    if (!webDistExists || req.method !== 'GET') {
      return reply.code(404).send({ error: 'Not found' });
    }
    return reply.sendFile('index.html');
  });

  return app;
}
