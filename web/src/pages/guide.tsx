import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Apple,
  BookOpen,
  Download,
  Laptop,
  Monitor,
  QrCode,
  ShieldCheck,
  Smartphone,
  Terminal,
  Wifi,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { CopyButton } from '@/components/copy-button';
import { cn } from '@/lib/utils';
import { useI18n, type TranslationKey } from '@/lib/i18n';

type OsKey = 'android' | 'ios' | 'windows' | 'macos' | 'linux';

const OS_TABS: { key: OsKey; labelKey: TranslationKey; icon: typeof Smartphone }[] = [
  { key: 'android', labelKey: 'guide.os.android', icon: Smartphone },
  { key: 'ios', labelKey: 'guide.os.ios', icon: Apple },
  { key: 'windows', labelKey: 'guide.os.windows', icon: Monitor },
  { key: 'macos', labelKey: 'guide.os.macos', icon: Laptop },
  { key: 'linux', labelKey: 'guide.os.linux', icon: Terminal },
];

const WIN_INSTALL = 'winget install WireGuard.WireGuard';
const BREW_INSTALL = 'brew install wireguard-tools';
const WG_QUICK = 'sudo wg-quick up ./wg0.conf\nsudo wg-quick down ./wg0.conf';
const WG_SHOW = 'sudo wg show';
const LINUX_INSTALL =
  '# Debian / Ubuntu\nsudo apt install wireguard\n\n# Fedora\nsudo dnf install wireguard-tools\n\n# Arch\nsudo pacman -S wireguard-tools';
const LINUX_PLACE = 'sudo install -m 600 wg0.conf /etc/wireguard/wg0.conf';
const LINUX_UPDOWN = 'sudo wg-quick up wg0\nsudo wg-quick down wg0';
const LINUX_ENABLE = 'sudo systemctl enable --now wg-quick@wg0';
const LINUX_VERIFY = 'sudo wg show\nip -brief addr show wg0';

interface GuideStep {
  titleKey: TranslationKey;
  bodyKey?: TranslationKey;
  code?: string;
  hintKey?: TranslationKey;
}

const GUIDE_STEPS: Record<OsKey, GuideStep[]> = {
  android: [
    { titleKey: 'guide.android.1.title', bodyKey: 'guide.android.1.body' },
    { titleKey: 'guide.android.2.title', bodyKey: 'guide.android.2.body' },
    { titleKey: 'guide.android.3.title', bodyKey: 'guide.android.3.body' },
    { titleKey: 'guide.android.4.title', bodyKey: 'guide.android.4.body' },
  ],
  ios: [
    { titleKey: 'guide.ios.1.title', bodyKey: 'guide.ios.1.body' },
    { titleKey: 'guide.ios.2.title', bodyKey: 'guide.ios.2.body' },
    { titleKey: 'guide.ios.3.title', bodyKey: 'guide.ios.3.body' },
    { titleKey: 'guide.ios.4.title', bodyKey: 'guide.ios.4.body' },
  ],
  windows: [
    { titleKey: 'guide.windows.1.title', bodyKey: 'guide.windows.1.body', code: WIN_INSTALL },
    { titleKey: 'guide.windows.2.title', bodyKey: 'guide.windows.2.body' },
    { titleKey: 'guide.windows.3.title', bodyKey: 'guide.windows.3.body' },
    { titleKey: 'guide.windows.4.title', bodyKey: 'guide.windows.4.body' },
  ],
  macos: [
    { titleKey: 'guide.macos.1.title', bodyKey: 'guide.macos.1.body', code: BREW_INSTALL },
    { titleKey: 'guide.macos.2.title', bodyKey: 'guide.macos.2.body' },
    { titleKey: 'guide.macos.3.title', bodyKey: 'guide.macos.3.body', code: WG_QUICK },
    { titleKey: 'guide.macos.4.title', bodyKey: 'guide.macos.4.body', code: WG_SHOW },
  ],
  linux: [
    { titleKey: 'guide.linux.1.title', code: LINUX_INSTALL },
    { titleKey: 'guide.linux.2.title', bodyKey: 'guide.linux.2.body', code: LINUX_PLACE },
    { titleKey: 'guide.linux.3.title', code: LINUX_UPDOWN },
    { titleKey: 'guide.linux.4.title', bodyKey: 'guide.linux.4.body', code: LINUX_ENABLE, hintKey: 'guide.linux.4.hint' },
    { titleKey: 'guide.linux.5.title', code: LINUX_VERIFY },
  ],
};

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative rounded-md border bg-muted/40">
      <pre className="overflow-x-auto p-3 pr-14 text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
      <div className="absolute right-1.5 top-1.5">
        <CopyButton value={code} label="" variant="ghost" />
      </div>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children?: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
        {n}
      </span>
      <div className="min-w-0 space-y-1.5">
        <p className="text-sm font-medium">{title}</p>
        {children ? <div className="space-y-2 text-sm text-muted-foreground">{children}</div> : null}
      </div>
    </li>
  );
}

export function GuidePage() {
  const { t } = useI18n();
  const [os, setOs] = useState<OsKey>('android');
  const active = OS_TABS.find((tab) => tab.key === os)!;
  const steps = GUIDE_STEPS[os];

  return (
    <div className="space-y-6">
      <PageHeader title={t('guide.title')} description={t('guide.subtitle')} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            {t('guide.getConfig.title')}
          </CardTitle>
          <CardDescription>{t('guide.getConfig.desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex gap-3 rounded-lg border p-3">
              <QrCode className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium">{t('guide.getConfig.qrTitle')}</p>
                <p className="text-muted-foreground">{t('guide.getConfig.qrDesc')}</p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border p-3">
              <Download className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium">{t('guide.getConfig.fileTitle')}</p>
                <p className="text-muted-foreground">{t('guide.getConfig.fileDesc')}</p>
              </div>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link to="/peers">{t('guide.getConfig.goToPeers')}</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            {t('guide.steps.title')}
          </CardTitle>
          <CardDescription>{t('guide.steps.desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {OS_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setOs(tab.key)}
                className={cn(
                  'flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                  os === tab.key
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <tab.icon className="h-4 w-4" />
                {t(tab.labelKey)}
              </button>
            ))}
          </div>
          <div className="border-t pt-5">
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <active.icon className="h-4 w-4" />
              {t(active.labelKey)}
            </p>
            <ol className="space-y-4">
              {steps.map((step, index) => (
                <Step key={step.titleKey} n={index + 1} title={t(step.titleKey)}>
                  {step.bodyKey ? <p>{t(step.bodyKey)}</p> : null}
                  {step.code ? <CodeBlock code={step.code} /> : null}
                  {step.hintKey ? (
                    <p className="text-xs">{t(step.hintKey)}</p>
                  ) : null}
                </Step>
              ))}
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-muted-foreground" />
            {t('guide.verify.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>{t('guide.verify.intro')}</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>{t('guide.verify.handshake')}</li>
            <li>{t('guide.verify.counters')}</li>
            <li>{t('guide.verify.badge')}</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            {t('guide.trouble.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">{t('guide.trouble.noHandshakeTitle')}</p>
            <p>{t('guide.trouble.noHandshakeBody')}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">{t('guide.trouble.linuxServiceTitle')}</p>
            <p>{t('guide.trouble.linuxServiceBody')}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">{t('guide.trouble.tailscaleTitle')}</p>
            <p>{t('guide.trouble.tailscaleBody')}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">{t('guide.trouble.desktopQrTitle')}</p>
            <p>{t('guide.trouble.desktopQrBody')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
