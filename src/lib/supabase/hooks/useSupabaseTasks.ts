import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../client';

export interface SupabaseTask {
  id: string;
  project_id: string;
  milestone_id?: string | null;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string | null;
  subtasks?: any[];
  created_at?: string;
}

export function useSupabaseTasks() {
  const [tasks, setTasks] = useState<SupabaseTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setTasks(data || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch tasks'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(async (taskData: Omit<SupabaseTask, 'id' | 'created_at'>) => {
    try {
      const { data, error: err } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

      if (err) throw err;
      setTasks(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Failed to add task:', err);
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<SupabaseTask>) => {
    try {
      const { data, error: err } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;
      setTasks(prev => prev.map(t => t.id === id ? data : t));
      return data;
    } catch (err) {
      console.error('Failed to update task:', err);
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      const { error: err } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (err) throw err;
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete task:', err);
      throw err;
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    refresh: fetchTasks
  };
}