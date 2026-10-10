import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../client';

export interface SupabaseMilestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: string;
  due_date: string | null;
  created_at: string;
}

export function useSupabaseMilestones() {
  const [milestones, setMilestones] = useState<SupabaseMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMilestones = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('milestones')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setMilestones(data || []);
    } catch (err) {
      console.error('Failed to fetch milestones:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch milestones'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const addMilestone = useCallback(async (milestoneData: Omit<SupabaseMilestone, 'id' | 'created_at'>) => {
    try {
      const { data, error: err } = await supabase
        .from('milestones')
        .insert([milestoneData])
        .select()
        .single();

      if (err) throw err;
      setMilestones(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Failed to add milestone:', err);
      throw err;
    }
  }, []);

  const updateMilestone = useCallback(async (id: string, updates: Partial<SupabaseMilestone>) => {
    try {
      const { data, error: err } = await supabase
        .from('milestones')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;
      setMilestones(prev => prev.map(m => m.id === id ? data : m));
      return data;
    } catch (err) {
      console.error('Failed to update milestone:', err);
      throw err;
    }
  }, []);

  const deleteMilestone = useCallback(async (id: string) => {
    try {
      const { error: err } = await supabase
        .from('milestones')
        .delete()
        .eq('id', id);

      if (err) throw err;
      setMilestones(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Failed to delete milestone:', err);
      throw err;
    }
  }, []);

  return {
    milestones,
    loading,
    error,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    refresh: fetchMilestones
  };
}