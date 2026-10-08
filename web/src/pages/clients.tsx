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
import { useI18n } from '@/lib/i18n';

function ClientCard({ config }: { config: ClientConfig }) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const [qrOpen, setQrOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const remove = useMutation({
    mutationFn: () => api.deleteClient(config.id),
    onSuccess: () => {
      toast.success(t('clients.toast.removed'));
      setConfirmDelete(false);
      void queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : t('clients.toast.deleteFailed')),
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
            <p className="text-xs text-muted-foreground">
              {t('clients.importedAt', { date: formatDate(config.createdAt) })}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setQrOpen(true)}>
            <QrCode />
            {t('common.qr')}
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href={downloadUrl(`/clients/${config.id}/config`)} download={config.filename}>
              <Download />
              {t('common.download')}
            </a>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto text-destructive hover:text-destructive"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 />
            {t('common.remove')}
          </Button>
        </div>
      </CardContent>

      <QrDialog
        open={qrOpen}
        onOpenChange={setQrOpen}
        title={t('peers.qrTitle', { name: config.name })}
        description={t('peers.qrDesc')}
        imageUrl={downloadUrl(`/clients/${config.id}/qr`)}
        downloadUrl={downloadUrl(`/clients/${config.id}/config`)}
        downloadName={config.filename}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={t('clients.removeTitle')}
        description={t('clients.removeDesc', { name: config.name })}
        confirmLabel={t('common.remove')}
        destructive
        loading={remove.isPending}
        onConfirm={() => remove.mutate()}
      />
    </Card>
  );
}

export function ClientsPage() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: configs, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: api.listClients,
  });

  const upload = useMutation({
    mutationFn: (file: File) => api.uploadClient(file),
    onSuccess: (config) => {
      toast.success(t('clients.toast.imported', { name: config.name }));
      void queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : t('clients.toast.importFailed')),
  });

  const onPick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) upload.mutate(file);
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('clients.title')}
        description={t('clients.subtitle')}
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
              {t('common.import')}
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
            <p className="font-medium">{t('clients.empty')}</p>
            <p className="max-w-sm text-sm text-muted-foreground">{t('clients.emptyHint')}</p>
            <Button onClick={() => inputRef.current?.click()}>
              <Upload />
              {t('common.import')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
