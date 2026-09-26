import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/supabase/hooks/useAuth';
import { Github, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { isValidEmail, normalizeEmail } from '@/lib/utils';

export const Route = createFileRoute('/auth/signup')({
  component: Signup,
});

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const { signUp, signInWithGoogle, loading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !fullName) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Normalize email
    const normalizedEmail = normalizeEmail(email);

    const { error: signUpError } = await signUp(normalizedEmail, password, fullName);
    
    if (signUpError) {
      toast.error(signUpError.message);
    } else {
      toast.success('Account created! Please check your email for verification.');
      navigate({ to: '/' });
    }
  };

  const handleGoogleSignup = async () => {
    const { error: googleError } = await signInWithGoogle();
    
    if (googleError) {
      toast.error(googleError.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Create account</h1>
          <p className="mt-2 text-muted-foreground">
            Get started with BPO Nexus
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleGoogleSignup}
            disabled={loading}
          >
            <Github className="mr-2 h-4 w-4" />
            Sign up with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or sign up with
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>

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
              <Label htmlFor="password">Password</Label>
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
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => navigate({ to: '/auth/login' })}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}