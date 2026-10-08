import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, FileText, Loader2, QrCode, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError, downloadUrl, type ClientConfig } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/page-header';
import { QrDialog } from '@/components/qr-dialog';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { formatDate } from '@/lib/format';

function ClientCard({ config }: { config: ClientConfig }) {
  const queryClient = useQueryClient();
  const [qrOpen, setQrOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const remove = useMutation({
    mutationFn: () => api.deleteClient(config.id),
    onSuccess: () => {
      toast.success('Config removed');
      setConfirmDelete(false);
      void queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Delete failed'),
  });

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{config.name}</p>
            <p className="truncate text-xs text-muted-foreground">{config.filename}</p>
            <p className="text-xs text-muted-foreground">Imported {formatDate(config.createdAt)}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setQrOpen(true)}>
            <QrCode />
            QR
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href={downloadUrl(`/clients/${config.id}/config`)} download={config.filename}>
              <Download />
              Download
            </a>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto text-destructive hover:text-destructive"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 />
            Remove
          </Button>
        </div>
      </CardContent>

      <QrDialog
        open={qrOpen}
        onOpenChange={setQrOpen}
        title={`${config.name} — QR code`}
        description="Scan with the WireGuard mobile app."
        imageUrl={downloadUrl(`/clients/${config.id}/qr`)}
        downloadUrl={downloadUrl(`/clients/${config.id}/config`)}
        downloadName={config.filename}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Remove config?"
        description={`"${config.name}" will be deleted from the library.`}
        confirmLabel="Remove"
        destructive
        loading={remove.isPending}
        onConfirm={() => remove.mutate()}
      />
    </Card>
  );
}

export function ClientsPage() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: configs, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: api.listClients,
  });

  const upload = useMutation({
    mutationFn: (file: File) => api.uploadClient(file),
    onSuccess: (config) => {
      toast.success(`Imported "${config.name}"`);
      void queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : 'Import failed'),
  });

  const onPick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) upload.mutate(file);
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client configs"
        description="Import and store WireGuard configurations from other servers or clients"
        actions={
          <>
            <input
              ref={inputRef}
              type="file"
              accept=".conf,.txt"
              className="hidden"
              onChange={onPick}
            />
            <Button onClick={() => inputRef.current?.click()} disabled={upload.isPending}>
              {upload.isPending ? <Loader2 className="animate-spin" /> : <Upload />}
              Import .conf
            </Button>
          </>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      ) : configs && configs.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {configs.map((config) => (
            <ClientCard key={config.id} config={config} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No imported configs</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Upload a WireGuard <code>.conf</code> file to keep it here for quick download or QR
              sharing.
            </p>
            <Button onClick={() => inputRef.current?.click()}>
              <Upload />
              Import .conf
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
