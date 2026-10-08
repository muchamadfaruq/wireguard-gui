import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  Globe,
  Loader2,
  Power,
  RefreshCw,
  Server,
  Users,
  Wifi,
} from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ServerStatusBadge, OnlineBadge } from '@/components/status-badge';
import { PageHeader } from '@/components/page-header';
import { useFormat } from '@/hooks/use-format';
import { useI18n } from '@/lib/i18n';

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="truncate text-lg font-semibold">{value}</p>
          {hint ? <p className="truncate text-xs text-muted-foreground">{hint}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { handshake, bytes } = useFormat();
  const { data: status, isLoading } = useQuery({
    queryKey: ['status'],
    queryFn: api.getStatus,
    refetchInterval: 10_000,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['status'] });

  const toggle = useMutation({
    mutationFn: (enabled: boolean) => (enabled ? api.serverUp() : api.serverDown()),
    onSuccess: (_data, enabled) => {
      toast.success(enabled ? t('dashboard.toast.started') : t('dashboard.toast.stopped'));
      void invalidate();
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : t('dashboard.toast.stateError')),
  });

  const restart = useMutation({
    mutationFn: api.serverRestart,
    onSuccess: () => {
      toast.success(t('dashboard.toast.restarted'));
      void invalidate();
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : t('dashboard.toast.restartError')),
  });

  const peers = status?.peers ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('dashboard.title')}
        description={t('dashboard.subtitle')}
        actions={
          <Button variant="outline" onClick={() => void invalidate()} disabled={isLoading}>
            <RefreshCw className={isLoading ? 'animate-spin' : ''} />
            {t('common.refresh')}
          </Button>
        }
      />

      {status?.backend === 'mock' ? (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
          {t('dashboard.mockWarning')}
        </div>
      ) : null}

      {status && !status.endpoint ? (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
          {t('dashboard.endpointWarning')}
        </div>
      ) : null}

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-muted-foreground" />
              {t('dashboard.server')}
            </CardTitle>
            <CardDescription>
              {status ? t('dashboard.interface', { name: status.interface }) : t('common.loading')}
            </CardDescription>
          </div>
          {isLoading || !status ? (
            <Skeleton className="h-6 w-24" />
          ) : (
            <div className="flex items-center gap-2">
              {status.managedExternally ? (
                <Badge variant="outline">{t('dashboard.adopted')}</Badge>
              ) : null}
              <ServerStatusBadge running={status.running} />
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-5">
          {status?.managedExternally ? (
            <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
              {t('dashboard.adoptedNotice')}{' '}
              {status.writeThrough
                ? t('dashboard.adoptedWriteOn')
                : t('dashboard.adoptedWriteOff')}
            </div>
          ) : null}

          {status && status.preflight.kernel === 'missing' && !status.preflight.userspace ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {t('dashboard.wgUnavailable')}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Power className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t('dashboard.power')}</p>
                <p className="text-xs text-muted-foreground">
                  {status?.managedExternally
                    ? t('dashboard.powerExternal')
                    : status?.running
                      ? t('dashboard.powerUp')
                      : t('dashboard.powerDown')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={Boolean(status?.enabled)}
                disabled={isLoading || toggle.isPending || Boolean(status?.managedExternally)}
                onCheckedChange={(checked) => toggle.mutate(checked)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => restart.mutate()}
                disabled={restart.isPending || Boolean(status?.managedExternally)}
              >
                {restart.isPending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                {t('dashboard.restart')}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Users}
              label={t('dashboard.peers')}
              value={isLoading || !status ? '—' : `${status.onlinePeers}/${status.peerCount}`}
              hint={t('dashboard.onlineTotal')}
            />
            <StatCard
              icon={Wifi}
              label={t('dashboard.listenPort')}
              value={isLoading || !status ? '—' : String(status.listenPort)}
              hint={t('common.udp')}
            />
            <StatCard
              icon={Globe}
              label={t('dashboard.endpoint')}
              value={status?.endpoint || t('common.notSet')}
              hint={t('dashboard.addressLabel', { addr: status?.address ?? '—' })}
            />
            <StatCard
              icon={Activity}
              label={t('dashboard.backend')}
              value={status?.backend === 'real' ? t('dashboard.backendReal') : t('dashboard.backendMock')}
              hint={status?.wgAvailable ? t('dashboard.wgDetected') : t('dashboard.wgNotFound')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.peerActivity')}</CardTitle>
          <CardDescription>{t('dashboard.peerActivityDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : peers.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t('dashboard.noPeers')}
            </p>
          ) : (
            <ul className="divide-y">
              {peers.map((peer) => (
                <li key={peer.publicKey} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm">{peer.publicKey.slice(0, 24)}…</p>
                    <p className="text-xs text-muted-foreground">
                      {peer.endpoint ?? t('dashboard.noEndpoint')} ·{' '}
                      {t('dashboard.handshake', { time: handshake(peer.latestHandshake) })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">
                      ↓ {bytes(peer.transferRx)} · ↑ {bytes(peer.transferTx)}
                    </span>
                    <OnlineBadge online={peer.online} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
