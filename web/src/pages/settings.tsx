import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/page-header';
import { CopyButton } from '@/components/copy-button';

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
  const { data, isLoading } = useQuery({
    queryKey: ['server-config'],
    queryFn: api.getServerConfig,
  });
  const [form, setForm] = useState<FormState>(EMPTY);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });

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
      toast.success('Settings saved');
      void queryClient.invalidateQueries({ queryKey: ['server-config'] });
      void queryClient.invalidateQueries({ queryKey: ['status'] });
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : 'Failed to save settings'),
  });

  const changePassword = useMutation({
    mutationFn: () => api.changePassword(passwords.current, passwords.next),
    onSuccess: () => {
      toast.success('Password updated');
      setPasswords({ current: '', next: '', confirm: '' });
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : 'Failed to update password'),
  });

  const onSubmitServer = (event: FormEvent) => {
    event.preventDefault();
    saveServer.mutate();
  };

  const onSubmitPassword = (event: FormEvent) => {
    event.preventDefault();
    if (passwords.next.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwords.next !== passwords.confirm) {
      toast.error('Password confirmation does not match');
      return;
    }
    changePassword.mutate();
  };

  const field = (key: keyof FormState) => ({
    value: form[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: event.target.value })),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Server parameters and account security" />

      <Card>
        <CardHeader>
          <CardTitle>Server</CardTitle>
          <CardDescription>
            These values control how client configurations are generated.
          </CardDescription>
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
                  <Label htmlFor="endpoint">Public endpoint (host or IP)</Label>
                  <Input
                    id="endpoint"
                    placeholder="vpn.example.com"
                    {...field('endpoint')}
                  />
                  <p className="text-xs text-muted-foreground">
                    Clients connect to this address on the listen port below.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dns">DNS</Label>
                  <Input id="dns" {...field('dns')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowedIps">Allowed IPs (client routing)</Label>
                  <Input id="allowedIps" {...field('allowedIps')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="listenPort">Listen port</Label>
                  <Input id="listenPort" type="number" {...field('listenPort')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mtu">MTU</Label>
                  <Input id="mtu" type="number" {...field('mtu')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keepalive">Persistent keepalive</Label>
                  <Input id="keepalive" type="number" {...field('persistentKeepalive')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subnet">Subnet (CIDR)</Label>
                  <Input id="subnet" {...field('subnet')} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Server address</Label>
                  <Input id="address" {...field('address')} />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Server public key</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {data?.publicKey ?? '—'}
                  </p>
                </div>
                {data?.publicKey ? <CopyButton value={data.publicKey} /> : null}
              </div>

              <Button type="submit" disabled={saveServer.isPending}>
                {saveServer.isPending ? <Loader2 className="animate-spin" /> : <Save />}
                Save changes
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-muted-foreground" />
            Change password
          </CardTitle>
          <CardDescription>Update the administrator account password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-3" onSubmit={onSubmitPassword}>
            <div className="space-y-2">
              <Label htmlFor="current">Current password</Label>
              <Input
                id="current"
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next">New password</Label>
              <Input
                id="next"
                type="password"
                value={passwords.next}
                onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
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
                Update password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
