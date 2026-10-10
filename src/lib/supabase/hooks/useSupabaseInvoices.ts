import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../client';

export interface SupabaseInvoice {
  id: string;
  client_id?: string | null;
  project_id?: string | null;
  invoice_number: string;
  status: string;
  amount: number;
  currency: string;
  due_date: string | null;
  line_items?: any[];
  created_at?: string;
}

export function useSupabaseInvoices() {
  const [invoices, setInvoices] = useState<SupabaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setInvoices(data || []);
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch invoices'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const addInvoice = useCallback(async (invoiceData: Omit<SupabaseInvoice, 'id' | 'created_at'>) => {
    try {
      const { data, error: err } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select()
        .single();

      if (err) throw err;
      setInvoices(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Failed to add invoice:', err);
      throw err;
    }
  }, []);

  const updateInvoice = useCallback(async (id: string, updates: Partial<SupabaseInvoice>) => {
    try {
      const { data, error: err } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;
      setInvoices(prev => prev.map(inv => inv.id === id ? data : inv));
      return data;
    } catch (err) {
      console.error('Failed to update invoice:', err);
      throw err;
    }
  }, []);

  const deleteInvoice = useCallback(async (id: string) => {
    try {
      const { error: err } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (err) throw err;
      setInvoices(prev => prev.filter(inv => inv.id !== id));
    } catch (err) {
      console.error('Failed to delete invoice:', err);
      throw err;
    }
  }, []);

  return {
    invoices,
    loading,
    error,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    refresh: fetchInvoices
  };
}