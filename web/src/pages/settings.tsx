import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Languages, Loader2, RefreshCw, Save, KeyRound, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/page-header';
import { CopyButton } from '@/components/copy-button';
import { LANGUAGES, useI18n, type Locale } from '@/lib/i18n';

interface FormState {
  endpoint: string;
  dns: string;
  allowedIps: string;
  listenPort: string;
  mtu: string;
  persistentKeepalive: string;
  address: string;
  subnet: string;
}

const EMPTY: FormState = {
  endpoint: '',
  dns: '',
  allowedIps: '',
  listenPort: '',
  mtu: '',
  persistentKeepalive: '',
  address: '',
  subnet: '',
};

export function SettingsPage() {
  const queryClient = useQueryClient();
  const { t, locale, setLocale } = useI18n();
  const { data, isLoading } = useQuery({
    queryKey: ['server-config'],
    queryFn: api.getServerConfig,
  });
  const { data: status } = useQuery({
    queryKey: ['status'],
    queryFn: api.getStatus,
    refetchInterval: 15_000,
  });
  const [form, setForm] = useState<FormState>(EMPTY);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const adoptMode = Boolean(data?.managedExternally);

  useEffect(() => {
    if (!data) return;
    setForm({
      endpoint: data.endpoint,
      dns: data.dns,
      allowedIps: data.allowedIps,
      listenPort: String(data.listenPort),
      mtu: String(data.mtu),
      persistentKeepalive: String(data.persistentKeepalive),
      address: data.address,
      subnet: data.subnet,
    });
  }, [data]);

  const saveServer = useMutation({
    mutationFn: () =>
      api.updateServerConfig({
        endpoint: form.endpoint.trim(),
        dns: form.dns.trim(),
        allowedIps: form.allowedIps.trim(),
        listenPort: Number(form.listenPort),
        mtu: Number(form.mtu),
        persistentKeepalive: Number(form.persistentKeepalive),
        address: form.address.trim(),
        subnet: form.subnet.trim(),
      }),
    onSuccess: () => {
      toast.success(t('settings.toast.saved'));
      void queryClient.invalidateQueries({ queryKey: ['server-config'] });
      void queryClient.invalidateQueries({ queryKey: ['status'] });
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : t('settings.toast.saveFailed')),
  });

  const changePassword = useMutation({
    mutationFn: () => api.changePassword(passwords.current, passwords.next),
    onSuccess: () => {
      toast.success(t('settings.toast.passwordUpdated'));
      setPasswords({ current: '', next: '', confirm: '' });
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : t('settings.toast.passwordFailed')),
  });

  const toggleWriteThrough = useMutation({
    mutationFn: (enabled: boolean) => api.updateServerConfig({ writeThrough: enabled }),
    onSuccess: (_result, enabled) => {
      toast.success(
        t('settings.writeThroughToast', {
          state: enabled ? t('settings.writeThroughOn') : t('settings.writeThroughOff'),
        }),
      );
      void queryClient.invalidateQueries({ queryKey: ['server-config'] });
      void queryClient.invalidateQueries({ queryKey: ['status'] });
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : t('settings.toast.writeThroughFailed')),
  });

  const reapply = useMutation({
    mutationFn: api.serverReapply,
    onSuccess: () => {
      toast.success(t('settings.toast.reapplied'));
      void queryClient.invalidateQueries({ queryKey: ['server-config'] });
      void queryClient.invalidateQueries({ queryKey: ['status'] });
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : t('settings.toast.reapplyFailed')),
  });

  const onSubmitServer = (event: FormEvent) => {
    event.preventDefault();
    saveServer.mutate();
  };

  const onSubmitPassword = (event: FormEvent) => {
    event.preventDefault();
    if (passwords.next.length < 6) {
      toast.error(t('settings.passwordTooShort'));
      return;
    }
    if (passwords.next !== passwords.confirm) {
      toast.error(t('settings.passwordMismatch'));
      return;
    }
    changePassword.mutate();
  };

  const field = (key: keyof FormState, disabled = false) => ({
    value: form[key],
    disabled,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: event.target.value })),
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t('settings.title')} description={t('settings.subtitle')} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-muted-foreground" />
            {t('common.language')}
          </CardTitle>
          <CardDescription>{t('common.languageDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <select
            aria-label={t('common.language')}
            value={locale}
            onChange={(event) => setLocale(event.target.value as Locale)}
            className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                {language.label}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.server')}</CardTitle>
          <CardDescription>{t('settings.serverDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <form className="space-y-5" onSubmit={onSubmitServer}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="endpoint">{t('settings.endpoint')}</Label>
                  <Input
                    id="endpoint"
                    placeholder={t('settings.endpointPlaceholder')}
                    {...field('endpoint')}
                  />
                  <p className="text-xs text-muted-foreground">{t('settings.endpointHint')}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dns">{t('settings.dns')}</Label>
                  <Input id="dns" {...field('dns')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowedIps">{t('settings.clientRouting')}</Label>
                  <Input id="allowedIps" {...field('allowedIps')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="listenPort">{t('settings.listenPort')}</Label>
                  <Input id="listenPort" type="number" {...field('listenPort', adoptMode)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mtu">{t('settings.mtu')}</Label>
                  <Input id="mtu" type="number" {...field('mtu', adoptMode)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keepalive">{t('settings.keepalive')}</Label>
                  <Input id="keepalive" type="number" {...field('persistentKeepalive')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subnet">{t('settings.subnet')}</Label>
                  <Input id="subnet" {...field('subnet', adoptMode)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">{t('settings.address')}</Label>
                  <Input id="address" {...field('address', adoptMode)} />
                </div>
              </div>

              {adoptMode ? (
                <p className="text-xs text-muted-foreground">{t('settings.adoptReadOnly')}</p>
              ) : null}

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{t('settings.publicKey')}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {data?.publicKey ?? '—'}
                  </p>
                </div>
                {data?.publicKey ? <CopyButton value={data.publicKey} /> : null}
              </div>

              <Button type="submit" disabled={saveServer.isPending}>
                {saveServer.isPending ? <Loader2 className="animate-spin" /> : <Save />}
                {t('settings.save')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {adoptMode ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-muted-foreground" />
              {t('settings.hostSync')}
            </CardTitle>
            <CardDescription>{t('settings.hostSyncDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{t('settings.writeThrough')}</p>
                <p className="text-xs text-muted-foreground">{t('settings.writeThroughDesc')}</p>
              </div>
              <Switch
                checked={Boolean(data?.writeThrough)}
                disabled={toggleWriteThrough.isPending}
                onCheckedChange={(checked) => toggleWriteThrough.mutate(checked)}
              />
            </div>

            {!status?.hostWritable ? (
              <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{t('settings.hostNotWritable')}</span>
              </div>
            ) : (
              <Badge variant="success" className="gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                {t('settings.hostWritable')}
              </Badge>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => reapply.mutate()}
              disabled={reapply.isPending}
            >
              {reapply.isPending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
              {t('settings.reapply')}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-muted-foreground" />
            {t('settings.changePassword')}
          </CardTitle>
          <CardDescription>{t('settings.changePasswordDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-3" onSubmit={onSubmitPassword}>
            <div className="space-y-2">
              <Label htmlFor="current">{t('settings.currentPassword')}</Label>
              <Input
                id="current"
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next">{t('settings.newPassword')}</Label>
              <Input
                id="next"
                type="password"
                value={passwords.next}
                onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">{t('settings.confirmPassword')}</Label>
              <Input
                id="confirm"
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                required
              />
            </div>
            <div className="sm:col-span-3">
              <Button type="submit" disabled={changePassword.isPending}>
                {changePassword.isPending ? <Loader2 className="animate-spin" /> : <Save />}
                {t('settings.updatePassword')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
