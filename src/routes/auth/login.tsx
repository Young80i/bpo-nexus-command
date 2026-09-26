import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/supabase/hooks/useAuth';
import { Github, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { isValidEmail, normalizeEmail } from '@/lib/utils';

export const Route = createFileRoute('/auth/login')({
  component: Login,
});

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signInWithGoogle, loading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Normalize email
    const normalizedEmail = normalizeEmail(email);

    const { error: signInError } = await signIn(normalizedEmail, password);
    
    if (signInError) {
      toast.error(signInError.message);
    } else {
      toast.success('Welcome back!');
      navigate({ to: '/' });
    }
  };

  const handleGoogleLogin = async () => {
    const { error: googleError } = await signInWithGoogle();
    
    if (googleError) {
      toast.error(googleError.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to your BPO Nexus account
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <Github className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  className="text-sm font-medium text-primary hover:underline"
                  onClick={() => navigate({ to: '/auth/forgot-password' })}
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => navigate({ to: '/auth/signup' })}
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}