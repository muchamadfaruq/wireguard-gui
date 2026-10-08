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
import { useI18n } from '@/lib/i18n';

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
  const { t } = useI18n();
  if (!status) return null;
  const { preflight } = status;
  const kernelLabel =
    preflight.kernel === 'builtin' || preflight.kernel === 'loaded'
      ? t('setup.kernel')
      : preflight.kernel === 'missing'
        ? t('setup.userspace')
        : t('setup.unknown');
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <Badge variant="secondary">{preflight.tools ? t('setup.wgReady') : t('setup.wgMissing')}</Badge>
      <Badge variant={preflight.kernel === 'missing' ? 'destructive' : 'secondary'}>
        {kernelLabel}: {preflight.kernel}
      </Badge>
      {preflight.userspace ? (
        <Badge variant="secondary">{t('setup.fallback', { name: preflight.userspace })}</Badge>
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
  const { t } = useI18n();
  const { data: status } = useSetupStatus();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<'fresh' | 'adopt'>('fresh');
  const [adoptInterface, setAdoptInterface] = useState('');
  const [form, setForm] = useState<FormState>(EMPTY);

  const hostConfigs = status?.hostConfigs ?? [];
  const hasHostConfig = hostConfigs.length > 0;

  // Step labels depend on whether we ask the adopt/fresh question.
  const labels = useMemo(
    () =>
      hasHostConfig
        ? [t('setup.step.account'), t('setup.step.method'), t('setup.step.network')]
        : [t('setup.step.account'), t('setup.step.network')],
    [hasHostConfig, t],
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
        toast.success(t('setup.toast.detected', { endpoint }));
      } else {
        toast.error(t('setup.toast.detectNoIp'));
      }
    },
    onError: () => toast.error(t('setup.toast.detectFailed')),
  });

  const submit = useMutation({
    mutationFn: (input: SetupInput) => api.submitSetup(input),
    onSuccess: async (result) => {
      queryClient.setQueryData(['me'], result.user);
      await queryClient.invalidateQueries({ queryKey: ['setup-status'] });
      await refresh();
      if (result.warning) toast.warning(result.warning);
      toast.success(t('setup.toast.complete'));
      navigate('/', { replace: true });
    },
    onError: (error) =>
      toast.error(error instanceof ApiError ? error.message : t('setup.toast.failed')),
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validateAccount = () => {
    if (!form.username.trim()) {
      toast.error(t('setup.usernameRequired'));
      return false;
    }
    if (form.password.length < 6) {
      toast.error(t('setup.passwordTooShort'));
      return false;
    }
    if (form.password !== form.confirm) {
      toast.error(t('setup.passwordMismatch'));
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
                {status.backend === 'real' ? t('setup.wgDetected') : t('setup.mockMode')}
              </Badge>
            ) : null}
          </div>
          <div>
            <CardTitle className="text-xl">{t('setup.title')}</CardTitle>
            <CardDescription>{t('setup.subtitle')}</CardDescription>
          </div>
          <StepIndicator labels={labels} step={step} />
          <PreflightLine status={status} />
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={onSubmit}>
            {step === 0 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="setup-username">{t('setup.adminUsername')}</Label>
                  <Input
                    id="setup-username"
                    value={form.username}
                    onChange={(e) => set('username', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setup-password">{t('setup.password')}</Label>
                  <Input
                    id="setup-password"
                    type="password"
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">{t('setup.passwordHint')}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setup-confirm">{t('setup.confirmPassword')}</Label>
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
                    <Label htmlFor="setup-token">{t('setup.token')}</Label>
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
                  {t('setup.methodIntro', { dir: status?.preflight.hostDir ?? '' })}
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
                      <p className="font-medium">{t('setup.adopt', { name: config.interface })}</p>
                      <p className="text-xs text-muted-foreground">
                        {t('setup.adoptDetail', {
                          address: config.address ?? t('setup.noAddress'),
                          port: config.listenPort ?? '—',
                          count: config.peerCount,
                        })}
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
                    <p className="font-medium">{t('setup.startFresh')}</p>
                    <p className="text-xs text-muted-foreground">{t('setup.startFreshDetail')}</p>
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
                        <p className="font-medium">{t('setup.adopting', { name: adoptInterface })}</p>
                        <p className="text-xs text-muted-foreground">{t('setup.adoptingDetail')}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">{t('setup.writeThrough')}</p>
                        <p className="text-xs text-muted-foreground">{t('setup.writeThroughDetail')}</p>
                      </div>
                      <Switch
                        checked={form.writeThrough}
                        onCheckedChange={(checked) => set('writeThrough', checked)}
                      />
                    </div>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="setup-endpoint">{t('setup.endpoint')}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="setup-endpoint"
                      placeholder={t('setup.endpointPlaceholder')}
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
                      {t('setup.detect')}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">{t('setup.endpointHint')}</p>
                </div>

                {hasHostConfig && mode === 'adopt' ? null : (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="setup-subnet">{t('setup.subnet')}</Label>
                        <Input
                          id="setup-subnet"
                          value={form.subnet}
                          onChange={(e) => set('subnet', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="setup-port">{t('setup.listenPort')}</Label>
                        <Input
                          id="setup-port"
                          type="number"
                          value={form.listenPort}
                          onChange={(e) => set('listenPort', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="setup-dns">{t('setup.dns')}</Label>
                        <Input
                          id="setup-dns"
                          value={form.dns}
                          onChange={(e) => set('dns', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="setup-mtu">{t('setup.mtu')}</Label>
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
                        <p className="text-sm font-medium">{t('setup.fullTunnel')}</p>
                        <p className="text-xs text-muted-foreground">{t('setup.fullTunnelHint')}</p>
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
                          <p className="text-sm font-medium">{t('setup.startInterface')}</p>
                          <p className="text-xs text-muted-foreground">
                            {status?.backend === 'mock'
                              ? t('setup.startInterfaceMock')
                              : t('setup.startInterfaceHint')}
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
                  {t('common.back')}
                </Button>
              ) : (
                <span />
              )}
              {step === 0 ? (
                <Button type="button" onClick={nextFromAccount}>
                  {t('common.continue')}
                  <ArrowRight />
                </Button>
              ) : step === methodStep ? (
                <Button type="button" onClick={() => setStep(networkStep)}>
                  {t('common.continue')}
                  <ArrowRight />
                </Button>
              ) : (
                <Button type="submit" disabled={submit.isPending}>
                  {submit.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
                  {t('setup.finish')}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
