import type { ErrorComponentProps } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, createContext, useContext, type ReactNode } from "react";

// 🛑 STANDARD IMPORT RESTORED: This tells Vite to run the Tailwind compiler!
import "../styles.css";

import { ThemeProvider } from "../lib/theme";
import { ProjectsProvider } from "../lib/projects-store";
import { WorkspaceProvider } from "../lib/workspace-store";
import { AutomationProvider } from "../lib/automation-store";
import { CtoAssistant } from "../components/ai/cto-panel";
import { Toaster } from "../components/ui/sonner";
import { AppShell } from "../components/layout/app-shell";
import { ClientsProvider } from "../lib/clients-store";
import { FilesProvider } from "../lib/files-store";
import { ProfileProvider } from "../lib/profile-store";
import { AuthProvider, useAuth } from "../lib/supabase/hooks/useAuth";

const MASTER_EMAIL = "chawenkuna11@gmail.com"; // <-- PUT YOUR EXACT EMAIL HERE

type AdminContextType = { isMaster: boolean };
const AdminContext = createContext<AdminContextType>({ isMaster: false });
export const useAdmin = () => useContext(AdminContext);

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <div className="mt-6">
          <Link to="/" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Go home</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">This page didn't load</h1>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Try again</button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
    links: [
      // Manual CSS link removed - Vite injects it automatically now!
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function AuthGuardWrapper() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  
  // GUEST CHECK: Check local storage for the guest bypass flag
  const isGuest = typeof window !== "undefined" && localStorage.getItem("bpo_guest_mode") === "true";
  
  // You are only the master if you are actually logged in AND your email matches
  const isMaster = !!user && user.email?.toLowerCase() === MASTER_EMAIL.toLowerCase();

  useEffect(() => {
    if (loading) return;

    const isAuthRoute = pathname === "/login";

    // If you are NOT logged in and NOT a guest, go to login.
    if (!user && !isGuest && !isAuthRoute) {
      navigate({ to: "/login", replace: true });
    } 
    // If you ARE logged in OR a guest, but sitting on the login page, go home.
    else if ((user || isGuest) && isAuthRoute) {
      navigate({ to: "/", replace: true });
    }
  }, [user, loading, pathname, navigate, isGuest]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-3 text-sm font-medium text-muted-foreground">Loading BPO Nexus...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ isMaster }}>
      <AppShell>
        {!isMaster && (user || isGuest) && (
          <div className="flex items-center justify-center gap-2 border-b border-primary/20 bg-primary/10 px-4 py-2 text-center text-xs font-medium text-primary">
            <span>✨ Portfolio Demo Mode (Read-Only) — You are exploring BPO Nexus as a guest visitor.</span>
          </div>
        )}
        <Outlet />
      </AppShell>
    </AdminContext.Provider>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ProfileProvider>
            <ClientsProvider>
              <FilesProvider>
                <ProjectsProvider>
                  <WorkspaceProvider>
                    <AutomationProvider>
                      <AuthGuardWrapper />
                      <CtoAssistant />
                      <Toaster />
                    </AutomationProvider>
                  </WorkspaceProvider>
                </ProjectsProvider>
              </FilesProvider>
            </ClientsProvider>
          </ProfileProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}