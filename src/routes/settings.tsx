import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/supabase/hooks/useAuth";
import { useTheme } from "@/lib/theme";
import { LogOut, Shield, Bell, Brain } from "lucide-react";
import { toast } from "sonner";
import { CTO_MODEL } from "@/lib/ai-provider.server";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — BPO Nexus" },
      { name: "description", content: "Workspace, team, billing and integration settings for BPO Nexus." },
      { property: "og:title", content: "Settings — BPO Nexus" },
      { property: "og:description", content: "Workspace, team and integration configuration." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, loading, error, signOut } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account, preferences, and application settings.</p>
      </div>

      {/* Account Section */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your profile and authentication information</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <p className="text-sm text-muted-foreground">Loading authentication status...</p>}
          {error && <p className="text-sm text-destructive">Error: {error.message}</p>}
          {user && (
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full brand-gradient text-sm font-bold text-primary-foreground">
                {user.user_metadata?.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt={user.user_metadata?.full_name || user.email || "User"}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  (user.email?.[0]?.toUpperCase() || (user.user_metadata?.full_name?.[0] || "?"))
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{user.user_metadata?.full_name || (user.email ? user.email.split('@')[0] : "User")}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Badge variant="outline" className="mt-1 text-xs">Authenticated via Google OAuth</Badge>
              </div>
            </div>
          )}
          {!user && !loading && (
            <p className="text-sm text-muted-foreground">Not authenticated</p>
          )}
        </CardContent>
      </Card>

      {/* Appearance Section */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of BPO Nexus</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{theme === "dark" ? "Dark" : "Light"} Mode</p>
              <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
            </div>
            <Button variant="outline" size="sm" onClick={toggle}>
              Toggle Theme
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Provider Section */}
      <Card>
        <CardHeader>
          <CardTitle>AI Settings</CardTitle>
          <CardDescription>AI integration and model configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Primary AI Provider</p>
                <p className="text-sm text-muted-foreground">NVIDIA Nemotron 3 Super via OpenRouter</p>
              </div>
              <Badge variant="secondary" className="text-xs">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Fallback AI Provider</p>
                <p className="text-sm text-muted-foreground">Gemini 3.5 Flash Lite via Google AI</p>
              </div>
              <Badge variant="outline" className="text-xs">Configured</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current Model</p>
                <p className="text-sm text-muted-foreground break-all">{CTO_MODEL}</p>
              </div>
              <Badge variant="outline" className="text-xs">Primary</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Account security and session controls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Authentication Method</p>
                <p className="text-sm text-muted-foreground">Google OAuth with Supabase</p>
              </div>
              <Badge variant="outline" className="text-xs">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Session Status</p>
                <p className="text-sm text-muted-foreground">
                  {user ? "Authenticated" : "Not signed in"}
                </p>
              </div>
              {user && <Badge variant="outline" className="text-xs">Active Session</Badge>}
            </div>
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => signOut().then(() => toast.success("Signed out successfully"))}
                className="text-destructive hover:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default SettingsPage;

