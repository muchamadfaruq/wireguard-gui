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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { CopyButton } from '@/components/copy-button';
import { cn } from '@/lib/utils';

type OsKey = 'android' | 'ios' | 'windows' | 'macos' | 'linux';

const OS_TABS: { key: OsKey; label: string; icon: typeof Smartphone }[] = [
  { key: 'android', label: 'Android', icon: Smartphone },
  { key: 'ios', label: 'iOS / iPadOS', icon: Apple },
  { key: 'windows', label: 'Windows', icon: Monitor },
  { key: 'macos', label: 'macOS', icon: Laptop },
  { key: 'linux', label: 'Linux', icon: Terminal },
];

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative rounded-md border bg-muted/40">
      <pre className="overflow-x-auto p-3 pr-14 text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
      <div className="absolute right-1.5 top-1.5">
        <CopyButton value={code} label="" variant="ghost" title="Copy" />
      </div>
    </div>
  );
}

function Steps({ children }: { children: ReactNode }) {
  return <ol className="space-y-4">{children}</ol>;
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

const CONTENT: Record<OsKey, ReactNode> = {
  android: (
    <Steps>
      <Step n={1} title="Install the WireGuard app">
        Install <strong>WireGuard</strong> from Google Play or F-Droid.
      </Step>
      <Step n={2} title="Add the tunnel">
        Open the app and tap <strong>+</strong>, then <strong>Scan from QR code</strong>. Scan the QR
        shown on the <strong>Peers</strong> page. If you downloaded the <code>.conf</code> file
        instead, choose <strong>Import from file or archive</strong>.
      </Step>
      <Step n={3} title="Activate">
        Tap the toggle next to the tunnel. Android asks to allow a VPN connection — approve it.
      </Step>
      <Step n={4} title="Verify">
        A key icon appears in the status bar, and <strong>Peers</strong> shows a handshake within a few
        seconds.
      </Step>
    </Steps>
  ),
  ios: (
    <Steps>
      <Step n={1} title="Install the WireGuard app">
        Install <strong>WireGuard</strong> from the App Store.
      </Step>
      <Step n={2} title="Add the tunnel">
        Tap <strong>+</strong> and choose <strong>Create from QR code</strong>, then scan the QR shown
        on the <strong>Peers</strong> page. Alternatively, open the downloaded <code>.conf</code> in
        the Files app and choose to open it with WireGuard.
      </Step>
      <Step n={3} title="Activate">
        Toggle the tunnel on and allow the VPN configuration prompt.
      </Step>
      <Step n={4} title="Verify">
        The VPN icon appears in the status bar, and <strong>Peers</strong> shows a handshake.
      </Step>
    </Steps>
  ),
  windows: (
    <Steps>
      <Step n={1} title="Install the WireGuard client">
        <p>
          Download it from wireguard.com/install, or install with winget:
        </p>
        <CodeBlock code="winget install WireGuard.WireGuard" />
      </Step>
      <Step n={2} title="Import the configuration">
        On <strong>Peers</strong>, click <strong>Config</strong> to download the <code>.conf</code>{" "}
        file. In the WireGuard client choose <strong>Add tunnel</strong> →{' '}
        <strong>Import tunnel(s) from file…</strong> and select it. The desktop client cannot scan a
        QR code.
      </Step>
      <Step n={3} title="Activate">
        Click <strong>Activate</strong>.
      </Step>
      <Step n={4} title="Verify">
        The client shows a recent <strong>Latest handshake</strong>, and <strong>Peers</strong> on this
        console marks the device online.
      </Step>
    </Steps>
  ),
  macos: (
    <Steps>
      <Step n={1} title="Install the WireGuard client">
        Install <strong>WireGuard</strong> from the Mac App Store, or for the command line use
        Homebrew:
        <CodeBlock code="brew install wireguard-tools" />
      </Step>
      <Step n={2} title="Import the configuration">
        Download the <code>.conf</code> from <strong>Peers</strong> → <strong>Config</strong>. In the
        app choose <strong>Import tunnel(s) from file…</strong> and select it.
      </Step>
      <Step n={3} title="Activate">
        Toggle the tunnel on, or with the CLI:
        <CodeBlock code={'sudo wg-quick up ./wg0.conf\nsudo wg-quick down ./wg0.conf'} />
      </Step>
      <Step n={4} title="Verify">
        Check the app status, or run:
        <CodeBlock code="sudo wg show" />
      </Step>
    </Steps>
  ),
  linux: (
    <Steps>
      <Step n={1} title="Install wireguard-tools">
        <CodeBlock
          code={
            '# Debian / Ubuntu\nsudo apt install wireguard\n\n# Fedora\nsudo dnf install wireguard-tools\n\n# Arch\nsudo pacman -S wireguard-tools'
          }
        />
      </Step>
      <Step n={2} title="Place the configuration">
        Download the <code>.conf</code> from <strong>Peers</strong> → <strong>Config</strong>, then
        install it with root-only permissions:
        <CodeBlock code="sudo install -m 600 wg0.conf /etc/wireguard/wg0.conf" />
      </Step>
      <Step n={3} title="Bring the tunnel up or down">
        <CodeBlock code={'sudo wg-quick up wg0\nsudo wg-quick down wg0'} />
      </Step>
      <Step n={4} title="Start automatically on boot">
        <p>
          The systemd unit name is the interface name <em>without</em> the <code>.conf</code> suffix:
        </p>
        <CodeBlock code="sudo systemctl enable --now wg-quick@wg0" />
        <p className="text-xs">
          Correct: <code>wg-quick@wg0</code> · Wrong: <code>wg-quick@wg0.conf</code>
        </p>
      </Step>
      <Step n={5} title="Verify">
        <CodeBlock code={'sudo wg show\nip -brief addr show wg0'} />
      </Step>
    </Steps>
  ),
};

export function GuidePage() {
  const [os, setOs] = useState<OsKey>('android');
  const active = OS_TABS.find((tab) => tab.key === os)!;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client setup guide"
        description="How to import and activate a WireGuard configuration on each operating system"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            Get a configuration first
          </CardTitle>
          <CardDescription>
            Every device needs its own peer so it gets unique keys and an address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex gap-3 rounded-lg border p-3">
              <QrCode className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium">Mobile (QR code)</p>
                <p className="text-muted-foreground">
                  On <strong>Peers</strong>, click <strong>QR</strong> and scan it with the WireGuard
                  app.
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border p-3">
              <Download className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium">Desktop (.conf file)</p>
                <p className="text-muted-foreground">
                  On <strong>Peers</strong>, click <strong>Config</strong> to download the file, then
                  import it.
                </p>
              </div>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link to="/peers">Go to Peers</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            Step-by-step instructions
          </CardTitle>
          <CardDescription>Choose your operating system.</CardDescription>
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
                {tab.label}
              </button>
            ))}
          </div>
          <div className="border-t pt-5">
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <active.icon className="h-4 w-4" />
              {active.label}
            </p>
            {CONTENT[os]}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-muted-foreground" />
            Verify the connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Once the tunnel is active, open <strong>Peers</strong> and look at the device card:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              A recent <strong>Handshake</strong> (a few seconds ago) means the tunnel is established.
            </li>
            <li>
              <strong>↓ / ↑</strong> counters increase as traffic flows.
            </li>
            <li>
              The badge shows the device as <Badge variant="success">online</Badge>.
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
            Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">No handshake at all</p>
            <p>
              Make sure the server interface is running (<strong>Dashboard</strong>), the public
              endpoint is set correctly (<strong>Settings</strong>), and the listen port is reachable
              over UDP from the client network.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">Linux: the service fails to start</p>
            <p>
              Use the interface name in the systemd unit: <code>wg-quick@wg0</code>, not{' '}
              <code>wg-quick@wg0.conf</code>. Inspect errors with{' '}
              <code>journalctl -xeu wg-quick@wg0</code>.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">Tailscale or another VPN stops working</p>
            <p>
              A full tunnel (<code>AllowedIPs = 0.0.0.0/0</code>) takes over the default route and can
              interfere with Tailscale policy routing. If you only need the VPN network, set
              <strong> Allowed IPs (client routing)</strong> in <strong>Settings</strong> to your
              WireGuard subnet (for example <code>10.8.0.0/24</code>) and download the configuration
              again.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">Desktop client cannot scan the QR code</p>
            <p>
              The Windows and macOS clients import <code>.conf</code> files. Use <strong>Config</strong>{' '}
              to download the file instead of the QR code.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
