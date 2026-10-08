import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Download, Loader2, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError, downloadUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { ConfirmDialog } from '@/components/confirm-dialog';

export function BackupPage() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<File | null>(null);

  const restore = useMutation({
    mutationFn: (file: File) => api.restoreBackup(file),
    onSuccess: (result) => {
      toast.success(`Backup restored — ${result.peerCount} peer(s)`);
      if (result.warning) toast.warning(result.warning);
      setPending(null);
      void queryClient.invalidateQueries();
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Restore failed');
      setPending(null);
    },
  });

  const onPick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setPending(file);
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Backup & Restore"
        description="Export or import your entire WireGuard GUI data"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-muted-foreground" />
              Export backup
            </CardTitle>
            <CardDescription>
              Downloads a ZIP archive containing the database, server config and imported client
              configs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href={downloadUrl('/backup')} download>
                <Download />
                Download backup
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-muted-foreground" />
              Restore backup
            </CardTitle>
            <CardDescription>
              Upload a previously exported ZIP. Your current data is backed up automatically before
              being replaced.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={inputRef}
              type="file"
              accept=".zip,application/zip"
              className="hidden"
              onChange={onPick}
            />
            <Button
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={restore.isPending}
            >
              {restore.isPending ? <Loader2 className="animate-spin" /> : <UploadCloud />}
              Choose backup file
            </Button>
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Restoring replaces all current peers, server settings and imported configs. The
                WireGuard interface will be restarted if it was enabled.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={Boolean(pending)}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
        title="Restore this backup?"
        description={
          pending
            ? `"${pending.name}" will overwrite the current data. A safety copy of the current data is kept on the server.`
            : undefined
        }
        confirmLabel="Restore"
        destructive
        loading={restore.isPending}
        onConfirm={() => pending && restore.mutate(pending)}
      />
    </div>
  );
}
