import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Download,
  KeyRound,
  Loader2,
  Plus,
  QrCode,
  RefreshCw,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError, downloadUrl, type PeerView } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/page-header';
import { OnlineBadge } from '@/components/status-badge';
import { CopyButton } from '@/components/copy-button';
import { QrDialog } from '@/components/qr-dialog';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { useFormat } from '@/hooks/use-format';
import { useI18n } from '@/lib/i18n';

function AddPeerDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [usePsk, setUsePsk] = useState(true);
  const [allowedIps, setAllowedIps] = useState('');
  const [keepalive, setKeepalive] = useState('');

  const create = useMutation({
    mutationFn: () =>
      api.createPeer({
        name: name.trim(),
        usePresharedKey: usePsk,
        allowedIps: allowedIps.trim() || undefined,
        persistentKeepalive: keepalive ? Number(keepalive) : undefined,
      }),
    onSuccess: () => {
      toast.success(t('peers.toast.created'));
      void queryClient.invalidateQueries({ queryKey: ['peers'] });
      void queryClient.invalidateQueries({ queryKey: ['status'] });
      setName('');
      setAllowedIps('');
      setKeepalive('');
      setUsePsk(true);
      onOpenChange(false);
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : t('peers.toast.createFailed')),
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('peers.add.title')}</DialogTitle>
          <DialogDescription>{t('peers.add.description')}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="peer-name">{t('peers.add.name')}</Label>
            <Input
              id="peer-name"
              placeholder={t('peers.add.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="peer-allowed">{t('peers.add.extraAllowedIps')}</Label>
            <Input
              id="peer-allowed"
              placeholder={t('peers.add.extraAllowedIpsPlaceholder')}
              value={allowedIps}
              onChange={(e) => setAllowedIps(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{t('peers.add.extraAllowedIpsHint')}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="peer-keepalive">{t('peers.add.keepalive')}</Label>
            <Input
              id="peer-keepalive"
              type="number"
              min={0}
              max={3600}
              placeholder="25"
              value={keepalive}
              onChange={(e) => setKeepalive(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">{t('peers.add.psk')}</p>
              <p className="text-xs text-muted-foreground">{t('peers.add.pskHint')}</p>
            </div>
            <Switch checked={usePsk} onCheckedChange={setUsePsk} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('peers.add.cancel')}
            </Button>
            <Button type="submit" disabled={create.isPending || !name.trim()}>
              {create.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
              {t('peers.add.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PeerCard({ peer, canRekey }: { peer: PeerView; canRekey: boolean }) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { handshake, bytes } = useFormat();
  const [qrOpen, setQrOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['peers'] });
    void queryClient.invalidateQueries({ queryKey: ['status'] });
  };

  const toggle = useMutation({
    mutationFn: (enabled: boolean) => api.updatePeer(peer.id, { enabled }),
    onSuccess: invalidate,
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : t('peers.toast.updateFailed')),
  });

  const remove = useMutation({
    mutationFn: () => api.deletePeer(peer.id),
    onSuccess: () => {
      toast.success(t('peers.toast.deleted'));
      setConfirmDelete(false);
      invalidate();
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : t('peers.toast.deleteFailed')),
  });

  const regen = useMutation({
    mutationFn: () => api.regeneratePeer(peer.id),
    onSuccess: () => {
      toast.success(t('peers.toast.regen'));
      setConfirmRegen(false);
      invalidate();
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : t('peers.toast.regenFailed')),
  });

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium">{peer.name}</p>
              {!peer.enabled ? <Badge variant="secondary">{t('common.disabled')}</Badge> : null}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {peer.address} · {peer.allowedIps}
            </p>
          </div>
          <OnlineBadge online={Boolean(peer.status?.online)} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
          <span>↓ {bytes(peer.status?.transferRx ?? 0)}</span>
          <span>↑ {bytes(peer.status?.transferTx ?? 0)}</span>
          <span>{t('peers.handshake', { time: handshake(peer.status?.latestHandshake ?? null) })}</span>
        </div>

        <p className="truncate font-mono text-xs text-muted-foreground">{peer.publicKey}</p>

        {!peer.hasPrivateKey ? (
          <p className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
            {t('peers.imported')}{' '}
            {canRekey ? t('peers.importedRekey') : t('peers.importedEnableWrite')}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setQrOpen(true)}
            disabled={!peer.hasPrivateKey}
            title={peer.hasPrivateKey ? t('peers.showQr') : t('peers.privateKeyUnavailable')}
          >
            <QrCode />
            {t('common.qr')}
          </Button>
          <CopyButton
            value={peer.config}
            label={t('common.copy')}
            disabled={!peer.hasPrivateKey}
            title={peer.hasPrivateKey ? t('peers.copyClientConfig') : t('peers.privateKeyUnavailable')}
          />
          <Button size="sm" variant="outline" asChild disabled={!peer.hasPrivateKey}>
            <a
              href={downloadUrl(`/peers/${peer.id}/config`)}
              download={`${peer.name}.conf`}
              aria-disabled={!peer.hasPrivateKey}
              className={!peer.hasPrivateKey ? 'pointer-events-none opacity-50' : ''}
            >
              <Download />
              {t('common.config')}
            </a>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setConfirmRegen(true)}
            disabled={!peer.hasPrivateKey && !canRekey}
            title={
              peer.hasPrivateKey
                ? t('peers.regenKeys')
                : canRekey
                  ? t('peers.recreateKeys')
                  : t('peers.privateKeyUnavailable')
            }
          >
            <RefreshCw />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setConfirmDelete(true)}
            className="text-destructive hover:text-destructive"
            title={t('peers.deletePeer')}
          >
            <Trash2 />
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{t('peers.enabled')}</span>
            <Switch
              checked={peer.enabled}
              disabled={toggle.isPending}
              onCheckedChange={(checked) => toggle.mutate(checked)}
            />
          </div>
        </div>
      </CardContent>

      <QrDialog
        open={qrOpen}
        onOpenChange={setQrOpen}
        title={t('peers.qrTitle', { name: peer.name })}
        description={t('peers.qrDesc')}
        imageUrl={downloadUrl(`/peers/${peer.id}/qr`)}
        downloadUrl={downloadUrl(`/peers/${peer.id}/config`)}
        downloadName={`${peer.name}.conf`}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={t('peers.deleteTitle')}
        description={t('peers.deleteDesc', { name: peer.name })}
        confirmLabel={t('common.delete')}
        destructive
        loading={remove.isPending}
        onConfirm={() => remove.mutate()}
      />

      <ConfirmDialog
        open={confirmRegen}
        onOpenChange={setConfirmRegen}
        title={peer.hasPrivateKey ? t('peers.regenTitle') : t('peers.recreateTitle')}
        description={peer.hasPrivateKey ? t('peers.regenDesc') : t('peers.recreateDesc')}
        confirmLabel={peer.hasPrivateKey ? t('peers.regenerate') : t('peers.recreate')}
        loading={regen.isPending}
        onConfirm={() => regen.mutate()}
      />
    </Card>
  );
}

export function PeersPage() {
  const { t } = useI18n();
  const [addOpen, setAddOpen] = useState(false);
  const { data: peers, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['peers'],
    queryFn: api.listPeers,
    refetchInterval: 10_000,
  });
  const { data: status } = useQuery({
    queryKey: ['status'],
    queryFn: api.getStatus,
    refetchInterval: 10_000,
  });
  const canRekey = Boolean(status?.writeThrough);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('peers.title')}
        description={t('peers.subtitle')}
        actions={
          <>
            <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
              <RefreshCw className={isFetching ? 'animate-spin' : ''} />
              {t('common.refresh')}
            </Button>
            <Button onClick={() => setAddOpen(true)}>
              <UserPlus />
              {t('peers.add')}
            </Button>
          </>
        }
      />

      {status?.managedExternally ? (
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          {t('peers.adoptNotice')}{' '}
          {status.writeThrough ? t('peers.adoptNoticeWriteOn') : t('peers.adoptNoticeWriteOff')}
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">{t('peers.loadFailed')}</p>
      ) : peers && peers.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {peers.map((peer) => (
            <PeerCard key={peer.id} peer={peer} canRekey={canRekey} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <KeyRound className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">{t('peers.empty')}</p>
            <p className="max-w-sm text-sm text-muted-foreground">{t('peers.emptyHint')}</p>
            <Button onClick={() => setAddOpen(true)}>
              <Plus />
              {t('peers.add')}
            </Button>
          </CardContent>
        </Card>
      )}

      <AddPeerDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
