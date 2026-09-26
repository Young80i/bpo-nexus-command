import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/supabase/hooks/useAuth';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import { isValidEmail, normalizeEmail } from '@/lib/utils';

export const Route = createFileRoute('/auth/forgot-password')({
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword, loading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Normalize email
    const normalizedEmail = normalizeEmail(email);

    const { error: resetError } = await resetPassword(normalizedEmail);
    
    if (resetError) {
      toast.error(resetError.message);
    } else {
      setIsSubmitted(true);
      toast.success('Password reset email sent! Check your inbox.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {isSubmitted ? 'Check your email' : 'Forgot password?'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {isSubmitted
              ? 'We sent a password reset link to your email address.'
              : 'Enter your email and we\'ll send you a link to reset your password.'}
          </p>
        </div>

        {isSubmitted ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={() => setIsSubmitted(false)}
              >
                try again
              </button>
            </p>
            <Button 
              className="w-full"
              onClick={() => navigate({ to: '/auth/login' })}
            >
              Back to login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </Button>
          </form>
        )}

        <div className="text-center text-sm text-muted-foreground">
          Remember your password?{' '}
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