import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { api } from '@/lib/api';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { ThemeProvider, useTheme } from '@/hooks/use-theme';
import { AppShell } from '@/layouts/app-shell';
import { FullScreenLoader } from '@/components/full-screen-loader';
import { SetupPage } from '@/pages/setup';
import { LoginPage } from '@/pages/login';
import { DashboardPage } from '@/pages/dashboard';
import { PeersPage } from '@/pages/peers';
import { GuidePage } from '@/pages/guide';
import { ClientsPage } from '@/pages/clients';
import { BackupPage } from '@/pages/backup';
import { SettingsPage } from '@/pages/settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5_000,
    },
  },
});

function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function PublicOnly() {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}

function AppToaster() {
  const { theme } = useTheme();
  return <Toaster theme={theme} position="top-right" richColors closeButton />;
}

function AppRoutes() {
  const { data: setup, isLoading } = useQuery({
    queryKey: ['setup-status'],
    queryFn: api.getSetupStatus,
    retry: 0,
    staleTime: 30_000,
  });

  if (isLoading) return <FullScreenLoader />;
  if (setup && !setup.initialized) return <SetupPage />;

  return (
    <Routes>
      <Route element={<PublicOnly />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="peers" element={<PeersPage />} />
          <Route path="guide" element={<GuidePage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="backup" element={<BackupPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
          <AppToaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
