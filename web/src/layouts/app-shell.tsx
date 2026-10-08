import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Activity,
  ArchiveRestore,
  BookOpen,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  Users,
  FileText,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { useI18n, type TranslationKey } from '@/lib/i18n';

const NAV_ITEMS: { to: string; labelKey: TranslationKey; icon: typeof Activity; end: boolean }[] = [
  { to: '/', labelKey: 'nav.dashboard', icon: Activity, end: true },
  { to: '/peers', labelKey: 'nav.peers', icon: Users, end: false },
  { to: '/guide', labelKey: 'nav.guide', icon: BookOpen, end: false },
  { to: '/clients', labelKey: 'nav.configs', icon: FileText, end: false },
  { to: '/backup', labelKey: 'nav.backup', icon: ArchiveRestore, end: false },
  { to: '/settings', labelKey: 'nav.settings', icon: Settings, end: false },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useI18n();
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )
          }
        >
          <item.icon className="h-4 w-4" />
          {t(item.labelKey)}
        </NavLink>
      ))}
    </nav>
  );
}

export function AppShell() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const current = NAV_ITEMS.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to),
  );

  return (
    <div className="min-h-full bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-card/60 px-4 py-6 backdrop-blur lg:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Shield className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <p className="font-semibold">{t('app.title')}</p>
            <p className="text-xs text-muted-foreground">{t('app.subtitle')}</p>
          </div>
        </div>
        <NavItems />
        <div className="mt-auto space-y-2 pt-6">
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={toggle}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === 'dark' ? t('theme.light') : t('theme.dark')}
          </Button>
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user?.username}</p>
              <p className="text-xs text-muted-foreground">{t('user.role')}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => void logout()} title={t('user.logout')}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setMenuOpen(true)}>
            <Menu className="h-4 w-4" />
          </Button>
          <span className="font-semibold">{current ? t(current.labelKey) : t('app.title')}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} title={t('theme.toggle')}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => void logout()} title={t('user.logout')}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogContent className="max-w-xs">
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {t('app.title')}
          </DialogTitle>
          <NavItems onNavigate={() => setMenuOpen(false)} />
        </DialogContent>
      </Dialog>

      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 lg:pl-72 lg:pr-8 lg:pb-10">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t bg-card/90 px-2 py-1.5 backdrop-blur lg:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 rounded-md px-1 py-1 text-[11px] font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
