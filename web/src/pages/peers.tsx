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
import { formatBytes, formatHandshake } from '@/lib/format';

function AddPeerDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
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
      toast.success('Peer created');
      void queryClient.invalidateQueries({ queryKey: ['peers'] });
      void queryClient.invalidateQueries({ queryKey: ['status'] });
      setName('');
      setAllowedIps('');
      setKeepalive('');
      setUsePsk(true);
      onOpenChange(false);
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : 'Failed to create peer'),
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add peer</DialogTitle>
          <DialogDescription>New keys and an IP address are generated automatically.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="peer-name">Name</Label>
            <Input
              id="peer-name"
              placeholder="e.g. laptop-faruq"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="peer-allowed">Extra allowed IPs (optional)</Label>
            <Input
              id="peer-allowed"
              placeholder="192.168.1.0/24"
              value={allowedIps}
              onChange={(e) => setAllowedIps(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Additional networks routed to this device (for example a LAN behind it). The generated
              tunnel address is always included, so this can usually be left empty.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="peer-keepalive">Persistent keepalive (optional)</Label>
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
              <p className="text-sm font-medium">Use preshared key</p>
              <p className="text-xs text-muted-foreground">Adds an extra layer of security.</p>
            </div>
            <Switch checked={usePsk} onCheckedChange={setUsePsk} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending || !name.trim()}>
              {create.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
              Create peer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PeerCard({ peer, canRekey }: { peer: PeerView; canRekey: boolean }) {
  const queryClient = useQueryClient();
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
    onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Update failed'),
  });

  const remove = useMutation({
    mutationFn: () => api.deletePeer(peer.id),
    onSuccess: () => {
      toast.success('Peer deleted');
      setConfirmDelete(false);
      invalidate();
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Delete failed'),
  });

  const regen = useMutation({
    mutationFn: () => api.regeneratePeer(peer.id),
    onSuccess: () => {
      toast.success('Keys regenerated');
      setConfirmRegen(false);
      invalidate();
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : 'Regenerate failed'),
  });

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium">{peer.name}</p>
              {!peer.enabled ? <Badge variant="secondary">Disabled</Badge> : null}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {peer.address} · {peer.allowedIps}
            </p>
          </div>
          <OnlineBadge online={Boolean(peer.status?.online)} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
          <span>↓ {formatBytes(peer.status?.transferRx ?? 0)}</span>
          <span>↑ {formatBytes(peer.status?.transferTx ?? 0)}</span>
          <span>Handshake {formatHandshake(peer.status?.latestHandshake ?? null)}</span>
        </div>

        <p className="truncate font-mono text-xs text-muted-foreground">{peer.publicKey}</p>

        {!peer.hasPrivateKey ? (
          <p className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
            Imported from an external interface — private key unavailable, so no client config/QR.
            {canRekey
              ? ' Use "Recreate" to generate a new key (the device must re-import).'
              : ' Enable write-through in Settings to recreate it.'}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setQrOpen(true)}
            disabled={!peer.hasPrivateKey}
            title={peer.hasPrivateKey ? 'Show QR code' : 'Private key unavailable'}
          >
            <QrCode />
            QR
          </Button>
          <CopyButton
            value={peer.config}
            label="Copy"
            disabled={!peer.hasPrivateKey}
            title={peer.hasPrivateKey ? 'Copy client config' : 'Private key unavailable'}
          />
          <Button size="sm" variant="outline" asChild disabled={!peer.hasPrivateKey}>
            <a
              href={downloadUrl(`/peers/${peer.id}/config`)}
              download={`${peer.name}.conf`}
              aria-disabled={!peer.hasPrivateKey}
              className={!peer.hasPrivateKey ? 'pointer-events-none opacity-50' : ''}
            >
              <Download />
              Config
            </a>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setConfirmRegen(true)}
            disabled={!peer.hasPrivateKey && !canRekey}
            title={
              peer.hasPrivateKey
                ? 'Regenerate keys'
                : canRekey
                  ? 'Recreate with new keys (device must re-import)'
                  : 'Private key unavailable (external peer)'
            }
          >
            <RefreshCw />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setConfirmDelete(true)}
            className="text-destructive hover:text-destructive"
            title="Delete peer"
          >
            <Trash2 />
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Enabled</span>
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
        title={`${peer.name} — QR code`}
        description="Scan with the WireGuard mobile app to import this peer."
        imageUrl={downloadUrl(`/peers/${peer.id}/qr`)}
        downloadUrl={downloadUrl(`/peers/${peer.id}/config`)}
        downloadName={`${peer.name}.conf`}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete peer?"
        description={`This permanently removes "${peer.name}" and revokes its access.`}
        confirmLabel="Delete"
        destructive
        loading={remove.isPending}
        onConfirm={() => remove.mutate()}
      />

      <ConfirmDialog
        open={confirmRegen}
        onOpenChange={setConfirmRegen}
        title={peer.hasPrivateKey ? 'Regenerate keys?' : 'Recreate with new keys?'}
        description={
          peer.hasPrivateKey
            ? 'The peer will need to import a new configuration; the old one stops working.'
            : 'A new key pair will be generated and written to /etc/wireguard. The existing device stops working until it imports the new configuration.'
        }
        confirmLabel={peer.hasPrivateKey ? 'Regenerate' : 'Recreate'}
        loading={regen.isPending}
        onConfirm={() => regen.mutate()}
      />
    </Card>
  );
}

export function PeersPage() {
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
        title="Peers"
        description="Devices connected to your WireGuard server"
        actions={
          <>
            <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
              <RefreshCw className={isFetching ? 'animate-spin' : ''} />
              Refresh
            </Button>
            <Button onClick={() => setAddOpen(true)}>
              <UserPlus />
              Add peer
            </Button>
          </>
        }
      />

      {status?.managedExternally ? (
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <strong>Adopt mode:</strong> the interface is managed by the host from{' '}
          <code>/etc/wireguard</code>. Peers imported from the host have no private key, so QR/Config
          are unavailable for them. Add a peer here, or use <strong>Recreate</strong> to generate new
          keys. {status.writeThrough
            ? 'Changes are written back to the host config.'
            : 'Enable write-through in Settings to persist changes to the host config.'}
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">Failed to load peers.</p>
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
            <p className="font-medium">No peers yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Add your first peer to generate a configuration and QR code.
            </p>
            <Button onClick={() => setAddOpen(true)}>
              <Plus />
              Add peer
            </Button>
          </CardContent>
        </Card>
      )}

      <AddPeerDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
