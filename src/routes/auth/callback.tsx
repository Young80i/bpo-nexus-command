import { useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/lib/supabase/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback,
});

function AuthCallback() {
  const { loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // The auth state is handled by the AuthProvider
    // Redirect to home after a short delay to ensure state is updated
    const timer = setTimeout(() => {
      navigate({ to: '/' });
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">
          {loading ? 'Authenticating...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  );
}