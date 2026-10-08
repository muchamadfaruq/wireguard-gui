import { config, ensureDataDirs } from './config';
import { initDb } from './db';
import { ensureBootstrapUser, purgeExpiredSessions } from './services/auth-service';
import { bootstrapServerConfig, restoreEnabledInterface } from './services/server-service';
import { ensureHostWatcher } from './services/host-sync-service';
import { getBackend } from './wg/backend';
import { buildApp } from './app';

async function main(): Promise<void> {
  ensureDataDirs();
  initDb();
  ensureBootstrapUser();
  purgeExpiredSessions();
  await bootstrapServerConfig();
  ensureHostWatcher();

  const backend = await getBackend();
  const app = await buildApp();

  await app.listen({ port: config.env.PORT, host: '0.0.0.0' });
  app.log.info(`WireGuard GUI listening on :${config.env.PORT} (backend: ${backend.kind})`);
  if (backend.kind === 'mock') {
    app.log.warn(
      'Running in MOCK mode: no real WireGuard binary detected. The interface is simulated.',
    );
  }

  try {
    await restoreEnabledInterface();
  } catch (error) {
    app.log.warn(
      { err: error },
      'Failed to restore the WireGuard interface on startup; check the interface state in Settings.',
    );
  }

  const timer = setInterval(purgeExpiredSessions, 60 * 60 * 1000);
  timer.unref();

  const shutdown = async (signal: string): Promise<void> => {
    app.log.info(`Received ${signal}, shutting down...`);
    await app.close();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((error) => {
  console.error('Fatal error during startup:', error);
  process.exit(1);
});
