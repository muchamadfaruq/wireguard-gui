import { config } from '../config';
import { serverRepo } from '../db/repositories';
import { startHostWatcher, stopHostWatcher } from '../wg/host-sync';
import { reapplyServer } from './server-service';

/**
 * (Re)configures the host file watcher based on the current server mode.
 * The watcher is only active in "adopt" mode, where the host owns the
 * configuration file.
 */
export function ensureHostWatcher(): void {
  const server = serverRepo.get();
  const iface = config.env.WG_INTERFACE;
  if (server?.managedExternally) {
    startHostWatcher(iface, {
      onImported: async (result) => {
        if (result.changed) await reapplyServer();
      },
      onError: (error) => {
        console.error('host-sync watcher error:', error);
      },
    });
  } else {
    stopHostWatcher();
  }
}
