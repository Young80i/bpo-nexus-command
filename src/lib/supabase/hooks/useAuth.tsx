import { useState, useEffect, useCallback, createContext, useContext, useMemo } from 'react';
import { supabase } from '../client';
import { normalizeEmail } from '@/lib/utils';
import type { User } from '../types';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

interface AuthContextType extends UseAuthReturn {}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        setError(sessionError);
        return;
      }
      setUser(session?.user || null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Authentication initialization failed'));
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAuthStateChange = useCallback(
    async (event: string, session: any) => {
      try {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'SIGNED_UP') {
          if (session?.user) {
            setUser(session.user);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Auth state change error'));
        setUser(null);
      }
    },
    []
  );

  useEffect(() => {
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      subscription.unsubscribe();
    };
  }, [initializeAuth, handleAuthStateChange]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const normalizedEmail = normalizeEmail(email);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });
      
      if (signInError) {
        return { error: signInError };
      }
      
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign in failed');
      setError(error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const normalizedEmail = normalizeEmail(email);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: fullName,
            email: normalizedEmail
          }
        }
      });
      
      if (signUpError) {
        return { error: signUpError };
      }
      
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign up failed');
      setError(error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      return { error: googleError };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Google sign in failed');
      setError(error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error: updateError } = await supabase.auth.updateUser({
        password
      });
      
      if (updateError) {
        return { error: updateError };
      }
      
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Update password failed');
      setError(error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const normalizedEmail = normalizeEmail(email);
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      
      if (resetError) {
        return { error: resetError };
      }
      
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Reset password failed');
      setError(error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  const authContextValue: AuthContextType = useMemo(() => ({
    user,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    updatePassword,
    resetPassword,
  }), [user, loading, error]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}
