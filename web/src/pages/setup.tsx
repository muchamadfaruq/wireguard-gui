import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FolderInput,
  Loader2,
  Plus,
  RadioTower,
  Server,
  Shield,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError, type SetupInput } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FormState {
  username: string;
  password: string;
  confirm: string;
  endpoint: string;
  subnet: string;
  listenPort: string;
  dns: string;
  mtu: string;
  persistentKeepalive: string;
  useFullTunnel: boolean;
  startInterface: boolean;
  writeThrough: boolean;
  token: string;
}

const EMPTY: FormState = {
  username: 'admin',
  password: '',
  confirm: '',
  endpoint: '',
  subnet: '10.8.0.0/24',
  listenPort: '51820',
  dns: '1.1.1.1',
  mtu: '1420',
  persistentKeepalive: '25',
  useFullTunnel: true,
  startInterface: true,
  writeThrough: true,
  token: '',
};

function StepIndicator({ labels, step }: { labels: string[]; step: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {labels.map((label, index) => (
        <div key={label} className="flex items-center gap-2">
          <span
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
              index < step
                ? 'bg-success text-success-foreground'
                : index === step
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground',
            )}
          >
            {index < step ? <Check className="h-3.5 w-3.5" /> : index + 1}
          </span>
          <span
            className={cn(
              'text-sm font-medium',
              index === step ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {label}
          </span>
          {index < labels.length - 1 ? <span className="h-px w-6 bg-border" /> : null}
        </div>
      ))}
    </div>
  );
}

function PreflightLine({ status }: { status: ReturnType<typeof useSetupStatus>['data'] }) {
  if (!status) return null;
  const { preflight } = status;
  const kernelLabel =
    preflight.kernel === 'builtin' || preflight.kernel === 'loaded'
      ? 'kernel'
      : preflight.kernel === 'missing'
        ? 'userspace'
        : 'unknown';
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <Badge variant="secondary">wg {preflight.tools ? 'ready' : 'missing'}</Badge>
      <Badge variant={preflight.kernel === 'missing' ? 'destructive' : 'secondary'}>
        {kernelLabel}: {preflight.kernel}
      </Badge>
      {preflight.userspace ? (
        <Badge variant="secondary">fallback: {preflight.userspace}</Badge>
      ) : null}
    </div>
  );
}

function useSetupStatus() {
  return useQuery({ queryKey: ['setup-status'], queryFn: api.getSetupStatus });
}

export function SetupPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const { data: status } = useSetupStatus();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<'fresh' | 'adopt'>('fresh');
  const [adoptInterface, setAdoptInterface] = useState('');
  const [form, setForm] = useState<FormState>(EMPTY);

  const hostConfigs = status?.hostConfigs ?? [];
  const hasHostConfig = hostConfigs.length > 0;

  // Step labels depend on whether we ask the adopt/fresh question.
  const labels = useMemo(
    () => (hasHostConfig ? ['Account', 'Method', 'Network'] : ['Account', 'Network']),
    [hasHostConfig],
  );
  const methodStep = hasHostConfig ? 1 : -1;
  const networkStep = hasHostConfig ? 2 : 1;

  useEffect(() => {
    if (!status) return;
    setForm((prev) => ({
      ...prev,
      username: status.defaults.username || prev.username,
      endpoint: status.defaults.endpoint || prev.endpoint,
      subnet: status.defaults.subnet,
      listenPort: String(status.defaults.listenPort),
      dns: status.defaults.dns,
      mtu: String(status.defaults.mtu),
      persistentKeepalive: String(status.defaults.persistentKeepalive),
    }));
    if (status.hostConfigs.length > 0) {
      setMode('adopt');
      setAdoptInterface((prev) => prev || status.hostConfigs[0]?.interface || '');
    }
  }, [status]);

  const detect = useMutation({
    mutationFn: api.detectEndpoint,
    onSuccess: (data) => {
      if (data.endpoint) {
        const endpoint = data.endpoint;
        setForm((prev) => ({ ...prev, endpoint }));
        toast.success(`Detected public endpoint: ${endpoint}`);
      } else {
        toast.error('Could not detect a public IP. Enter it manually.');
      }
    },
    onError: () => toast.error('Detection failed. Enter the endpoint manually.'),
  });

  const submit = useMutation({
    mutationFn: (input: SetupInput) => api.submitSetup(input),
    onSuccess: async (result) => {
      queryClient.setQueryData(['me'], result.user);
      await queryClient.invalidateQueries({ queryKey: ['setup-status'] });
      await refresh();
      if (result.warning) toast.warning(result.warning);
      toast.success('Setup complete. Welcome!');
      navigate('/', { replace: true });
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Setup failed'),
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validateAccount = () => {
    if (!form.username.trim()) {
      toast.error('Username is required');
      return false;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (form.password !== form.confirm) {
      toast.error('Password confirmation does not match');
      return false;
    }
    return true;
  };

  const nextFromAccount = () => {
    if (!validateAccount()) return;
    setStep(hasHostConfig ? methodStep : networkStep);
  };

  const goBack = () => {
    if (step === networkStep) {
      setStep(hasHostConfig ? methodStep : 0);
    } else if (step === methodStep) {
      setStep(0);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const input: SetupInput = {
      mode: hasHostConfig ? mode : 'fresh',
      username: form.username.trim(),
      password: form.password,
      token: form.token.trim() || undefined,
    };
    if (hasHostConfig && mode === 'adopt') {
      input.adoptInterface = adoptInterface;
      input.endpoint = form.endpoint.trim();
      input.writeThrough = form.writeThrough;
    } else {
      input.endpoint = form.endpoint.trim();
      input.subnet = form.subnet.trim();
      input.listenPort = Number(form.listenPort);
      input.dns = form.dns.trim();
      input.mtu = Number(form.mtu);
      input.persistentKeepalive = Number(form.persistentKeepalive);
      input.useFullTunnel = form.useFullTunnel;
      input.startInterface = form.startInterface;
    }
    submit.mutate(input);
  };

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-10">
      <Card className="w-full max-w-lg animate-fade-in">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Shield className="h-5 w-5" />
            </span>
            {status ? (
              <Badge variant={status.backend === 'real' ? 'success' : 'secondary'}>
                {status.backend === 'real' ? 'WireGuard detected' : 'Mock mode'}
              </Badge>
            ) : null}
          </div>
          <div>
            <CardTitle className="text-xl">Welcome — let's set things up</CardTitle>
            <CardDescription>
              Create your administrator account and configure the WireGuard server.
            </CardDescription>
          </div>
          <StepIndicator labels={labels} step={step} />
          <PreflightLine status={status} />
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={onSubmit}>
            {step === 0 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="setup-username">Admin username</Label>
                  <Input
                    id="setup-username"
                    value={form.username}
                    onChange={(e) => set('username', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setup-password">Password</Label>
                  <Input
                    id="setup-password"
                    type="password"
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">At least 6 characters.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setup-confirm">Confirm password</Label>
                  <Input
                    id="setup-confirm"
                    type="password"
                    value={form.confirm}
                    onChange={(e) => set('confirm', e.target.value)}
                    required
                  />
                </div>
                {status?.requiresToken ? (
                  <div className="space-y-2">
                    <Label htmlFor="setup-token">Setup token</Label>
                    <Input
                      id="setup-token"
                      value={form.token}
                      onChange={(e) => set('token', e.target.value)}
                      required
                    />
                  </div>
                ) : null}
              </div>
            ) : null}

            {step === methodStep ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  An existing WireGuard configuration was found in{' '}
                  <code>{status?.preflight.hostDir}</code>. How would you like to proceed?
                </p>
                {hostConfigs.map((config) => (
                  <button
                    type="button"
                    key={config.interface}
                    onClick={() => {
                      setMode('adopt');
                      setAdoptInterface(config.interface);
                    }}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors',
                      mode === 'adopt' && adoptInterface === config.interface
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-accent',
                    )}
                  >
                    <FolderInput className="mt-0.5 h-5 w-5 text-primary" />
                    <div className="min-w-0">
                      <p className="font-medium">Adopt "{config.interface}"</p>
                      <p className="text-xs text-muted-foreground">
                        {config.address ?? 'no address'} · port {config.listenPort ?? '—'} ·{' '}
                        {config.peerCount} peer(s). The host keeps managing the interface.
                      </p>
                    </div>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setMode('fresh')}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors',
                    mode === 'fresh' ? 'border-primary bg-primary/5' : 'hover:bg-accent',
                  )}
                >
                  <Plus className="mt-0.5 h-5 w-5 text-primary" />
                  <div className="min-w-0">
                    <p className="font-medium">Start fresh</p>
                    <p className="text-xs text-muted-foreground">
                      Create a new server configuration managed entirely by this app. Use a
                      different interface name/port to avoid conflicts.
                    </p>
                  </div>
                </button>
              </div>
            ) : null}

            {step === networkStep ? (
              <div className="space-y-4">
                {hasHostConfig && mode === 'adopt' ? (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
                      <Server className="mt-0.5 h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium">Adopting "{adoptInterface}"</p>
                        <p className="text-xs text-muted-foreground">
                          The interface lifecycle stays with the host. Peers imported from the host
                          have no private key, so client configs/QR cannot be generated for them.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">Write changes to host config</p>
                        <p className="text-xs text-muted-foreground">
                          Keep <code>/etc/wireguard</code> in sync (two-way). Recommended.
                        </p>
                      </div>
                      <Switch
                        checked={form.writeThrough}
                        onCheckedChange={(checked) => set('writeThrough', checked)}
                      />
                    </div>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="setup-endpoint">Public endpoint (host or IP)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="setup-endpoint"
                      placeholder="vpn.example.com"
                      value={form.endpoint}
                      onChange={(e) => set('endpoint', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => detect.mutate()}
                      disabled={detect.isPending}
                    >
                      {detect.isPending ? <Loader2 className="animate-spin" /> : <Wand2 />}
                      Detect
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Address clients use to reach this server. Leave blank to set it later.
                  </p>
                </div>

                {hasHostConfig && mode === 'adopt' ? null : (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="setup-subnet">Subnet (CIDR)</Label>
                        <Input
                          id="setup-subnet"
                          value={form.subnet}
                          onChange={(e) => set('subnet', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="setup-port">Listen port</Label>
                        <Input
                          id="setup-port"
                          type="number"
                          value={form.listenPort}
                          onChange={(e) => set('listenPort', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="setup-dns">DNS</Label>
                        <Input
                          id="setup-dns"
                          value={form.dns}
                          onChange={(e) => set('dns', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="setup-mtu">MTU</Label>
                        <Input
                          id="setup-mtu"
                          type="number"
                          value={form.mtu}
                          onChange={(e) => set('mtu', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">Full tunnel (route all traffic)</p>
                        <p className="text-xs text-muted-foreground">
                          Push <code>0.0.0.0/0</code> to clients.
                        </p>
                      </div>
                      <Switch
                        checked={form.useFullTunnel}
                        onCheckedChange={(checked) => set('useFullTunnel', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <RadioTower className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Start the interface now</p>
                          <p className="text-xs text-muted-foreground">
                            {status?.backend === 'mock'
                              ? 'Simulated in mock mode.'
                              : 'Bring the WireGuard tunnel up right away.'}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={form.startInterface}
                        onCheckedChange={(checked) => set('startInterface', checked)}
                      />
                    </div>
                  </>
                )}
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-2 pt-1">
              {step > 0 ? (
                <Button type="button" variant="outline" onClick={goBack}>
                  <ArrowLeft />
                  Back
                </Button>
              ) : (
                <span />
              )}
              {step === 0 ? (
                <Button type="button" onClick={nextFromAccount}>
                  Continue
                  <ArrowRight />
                </Button>
              ) : step === methodStep ? (
                <Button type="button" onClick={() => setStep(networkStep)}>
                  Continue
                  <ArrowRight />
                </Button>
              ) : (
                <Button type="submit" disabled={submit.isPending}>
                  {submit.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
                  Finish setup
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
