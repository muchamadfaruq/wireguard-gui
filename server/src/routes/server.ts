import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  getInterfaceStatus,
  getServerConfigView,
  reapplyServer,
  restartServer,
  setServerEnabled,
  updateServerConfig,
} from '../services/server-service';

const patchSchema = z.object({
  address: z.string().regex(/^[0-9.]+\/\d{1,2}$/).optional(),
  subnet: z.string().regex(/^[0-9.]+\/\d{1,2}$/).optional(),
  listenPort: z.number().int().min(1).max(65535).optional(),
  mtu: z.number().int().min(576).max(9000).optional(),
  dns: z.string().optional(),
  endpoint: z.string().optional(),
  allowedIps: z.string().min(1).optional(),
  persistentKeepalive: z.number().int().min(0).max(3600).optional(),
  writeThrough: z.boolean().optional(),
});

export async function serverRoutes(app: FastifyInstance): Promise<void> {
  app.get('/config', async () => getServerConfigView());

  app.get('/status', async () => getInterfaceStatus());

  app.patch('/config', async (req) => {
    const patch = patchSchema.parse(req.body);
    await updateServerConfig(patch);
    return getServerConfigView();
  });

  app.post('/up', async () => {
    await setServerEnabled(true);
    return getInterfaceStatus();
  });

  app.post('/down', async () => {
    await setServerEnabled(false);
    return getInterfaceStatus();
  });

  app.post('/restart', async () => {
    await restartServer();
    return getInterfaceStatus();
  });

  app.post('/reapply', async () => {
    await reapplyServer();
    return getInterfaceStatus();
  });
}
