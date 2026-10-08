import type { FastifyInstance } from 'fastify';
import { ApiError } from '../utils/http-error';
import { createBackup, restoreBackup } from '../services/backup-service';

export async function backupRoutes(app: FastifyInstance): Promise<void> {
  app.get('/', async (_req, reply) => {
    const { filename, buffer } = createBackup();
    reply
      .type('application/zip')
      .header('Content-Disposition', `attachment; filename="${filename}"`);
    return buffer;
  });

  app.post('/restore', async (req, reply) => {
    if (!req.isMultipart()) {
      throw new ApiError(400, 'Expected multipart/form-data upload');
    }
    const data = await req.file();
    if (!data) {
      throw new ApiError(400, 'No file uploaded');
    }
    const buffer = await data.toBuffer();
    const result = await restoreBackup(buffer);
    return reply.send(result);
  });
}
