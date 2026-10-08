import type { FastifyInstance } from 'fastify';
import { ApiError, notFound } from '../utils/http-error';
import {
  deleteClientConfig,
  getClientConfig,
  getClientQrPng,
  importClientConfig,
  listClientConfigs,
} from '../services/client-service';

function fieldValue(field: unknown): string | undefined {
  if (field && typeof field === 'object' && 'value' in field) {
    const value = (field as { value: unknown }).value;
    return typeof value === 'string' ? value : undefined;
  }
  return undefined;
}

function safeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '_') || 'config';
}

export async function clientRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', async () => listClientConfigs());

  app.post('/', async (req, reply) => {
    if (!req.isMultipart()) {
      throw new ApiError(400, 'Expected multipart/form-data upload');
    }
    const data = await req.file();
    if (!data) {
      throw new ApiError(400, 'No file uploaded');
    }
    const content = (await data.toBuffer()).toString('utf8');
    const name = fieldValue(data.fields?.name);
    const config = importClientConfig({ filename: data.filename, content, name });
    return reply.code(201).send(config);
  });

  app.delete('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    deleteClientConfig(id);
    return reply.code(204).send();
  });

  app.get('/:id/config', async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      const config = getClientConfig(id);
      reply
        .type('text/plain; charset=utf-8')
        .header('Content-Disposition', `attachment; filename="${safeFilename(config.filename)}"`);
      return config.content;
    } catch {
      throw notFound('Client config not found');
    }
  });

  app.get('/:id/qr', async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      const png = await getClientQrPng(id);
      return reply.type('image/png').send(png);
    } catch {
      throw notFound('Client config not found');
    }
  });
}
