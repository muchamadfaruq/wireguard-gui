import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ApiError, notFound } from '../utils/http-error';
import {
  createPeer,
  deletePeer,
  getPeerConfig,
  getPeerQrPng,
  listPeerViews,
  regeneratePeerKeys,
  updatePeer,
} from '../services/peer-service';

const createSchema = z.object({
  name: z.string().min(1).max(64),
  usePresharedKey: z.boolean().optional(),
  allowedIps: z.string().optional(),
  persistentKeepalive: z.number().int().min(0).max(3600).optional(),
  notes: z.string().max(500).optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).max(64).optional(),
  enabled: z.boolean().optional(),
  allowedIps: z.string().optional(),
  persistentKeepalive: z.number().int().min(0).max(3600).optional(),
  notes: z.string().max(500).nullable().optional(),
});

function safeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '_') || 'peer';
}

export async function peerRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', async () => listPeerViews());

  app.post('/', async (req, reply) => {
    const input = createSchema.parse(req.body);
    const peer = await createPeer(input);
    return reply.code(201).send(peer);
  });

  app.patch('/:id', async (req) => {
    const { id } = req.params as { id: string };
    const patch = updateSchema.parse(req.body);
    return updatePeer(id, patch);
  });

  app.delete('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    await deletePeer(id);
    return reply.code(204).send();
  });

  app.post('/:id/regenerate', async (req) => {
    const { id } = req.params as { id: string };
    return regeneratePeerKeys(id);
  });

  app.get('/:id/config', async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      const { peer, config } = getPeerConfig(id);
      reply
        .type('text/plain; charset=utf-8')
        .header('Content-Disposition', `attachment; filename="${safeFilename(peer.name)}.conf"`);
      return config;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw notFound('Peer not found');
    }
  });

  app.get('/:id/qr', async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      const png = await getPeerQrPng(id);
      return reply.type('image/png').send(png);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw notFound('Peer not found');
    }
  });
}
