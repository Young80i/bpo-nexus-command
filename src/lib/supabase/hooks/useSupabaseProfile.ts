import { useState, useEffect, useCallback } from 'react';
import { defaultProfile } from '@/lib/profile-store';

export function useSupabaseProfile() {
  const [profile, setProfile] = useState<any>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load profile from localStorage (for now, until we have user authentication)
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const stored = localStorage.getItem('bpo-nexus:profile');
      if (stored) {
        setProfile(JSON.parse(stored));
      } else {
        setProfile(defaultProfile);
      }
    } catch (err) {
      console.warn('Failed to load profile, using default:', err);
      setProfile(defaultProfile);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize profile on mount
  useEffect(() => {
    loadProfile().catch(setError);
  }, [loadProfile]);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<any>) => {
    try {
      const updatedProfile = { ...profile, ...updates };
      localStorage.setItem('bpo-nexus:profile', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
      throw err;
    }
  }, [profile]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refresh: loadProfile
  };
}