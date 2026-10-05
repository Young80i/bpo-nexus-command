import { useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/lib/supabase/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback,
});

function AuthCallback() {
  // Wait for auth state to load, then redirect based on user
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return; // Do nothing while loading

    if (user) {
      // User exists, navigate to home
      navigate({ to: "/" });
    } else {
      // No user, navigate to login
      navigate({ to: "/auth/login" });
    }
  }, [user, loading, navigate]);

  return null; // No UI needed for callback
}
