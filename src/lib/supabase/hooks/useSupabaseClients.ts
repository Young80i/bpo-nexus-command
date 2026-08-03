import { useState, useEffect, useCallback } from 'react';
import { supabaseServices } from '../services';
import type { Client as SupabaseClient } from '../types';
import { clients as seedClients } from '@/data/demo';
import { supabaseClientToAppClient, appClientToSupabaseClient } from '../adapters';
import type { Client as AppClient } from '@/data/demo';

export function useSupabaseClients() {
  const [clients, setClients] = useState<AppClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load clients from Supabase or fallback to seed data
  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      const data = await supabaseServices.clients.getAll();
      // Convert Supabase clients to app clients
      const appClients = data.map(supabaseClientToAppClient);
      setClients(appClients);
    } catch (err) {
      console.warn('Failed to load clients from Supabase, using seed data:', err);
      // Fallback to seed data if Supabase fails
      setClients(seedClients);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize clients on mount
  useEffect(() => {
    loadClients().catch(setError);
  }, [loadClients]);

  // Create a new client
  const createClient = useCallback(async (clientData: Omit<AppClient, 'id' | 'attachments' | 'since'>) => {
    try {
      // Convert app client to Supabase client
      const supabaseClientData = appClientToSupabaseClient({
        ...clientData,
        id: '',
        attachments: [],
        since: new Date().toISOString().split('T')[0]
      } as AppClient);
      
      const newClient = await supabaseServices.clients.create(supabaseClientData);
      // Convert back to app client
      const appClient = supabaseClientToAppClient(newClient);
      setClients(prev => [appClient, ...prev]);
      return appClient;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create client'));
      throw err;
    }
  }, []);

  // Update an existing client
  const updateClient = useCallback(async (id: string, updates: Partial<Omit<AppClient, 'id' | 'attachments' | 'since'>>) => {
    try {
      // Convert updates to Supabase format
      const supabaseUpdates: any = {};
      if (updates.name !== undefined) supabaseUpdates.name = updates.name;
      if (updates.country !== undefined) supabaseUpdates.country = updates.country;
      if (updates.countryCode !== undefined) supabaseUpdates.country_code = updates.countryCode;
      if (updates.freelancerUsername !== undefined) supabaseUpdates.freelancer_username = updates.freelancerUsername;
      if (updates.email !== undefined) supabaseUpdates.email = updates.email;
      if (updates.phone !== undefined) supabaseUpdates.phone = updates.phone;
      if (updates.company !== undefined) supabaseUpdates.company = updates.company;
      if (updates.totalProjects !== undefined) supabaseUpdates.total_projects = updates.totalProjects;
      if (updates.totalRevenue !== undefined) supabaseUpdates.total_revenue = updates.totalRevenue;
      if (updates.rating !== undefined) supabaseUpdates.rating = updates.rating;
      if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes;
      if (updates.status !== undefined) supabaseUpdates.status = updates.status;
      
      const updatedClient = await supabaseServices.clients.update(id, supabaseUpdates);
      // Convert back to app client
      const appClient = supabaseClientToAppClient(updatedClient);
      setClients(prev => prev.map(client => client.id === id ? { ...client, ...appClient } : client));
      return appClient;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update client'));
      throw err;
    }
  }, []);

  // Delete a client
  const deleteClient = useCallback(async (id: string) => {
    try {
      await supabaseServices.clients.delete(id);
      setClients(prev => prev.filter(client => client.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete client'));
      throw err;
    }
  }, []);

  // Check for duplicate client
  const isDuplicate = useCallback((email: string, username: string, ignoreId?: string) => {
    return clients.some(
      (c) =>
        c.id !== ignoreId &&
        (c.email.trim().toLowerCase() === email.trim().toLowerCase() ||
          c.freelancerUsername.trim().toLowerCase() === username.trim().toLowerCase()),
    );
  }, [clients]);

  return {
    clients,
    loading,
    error,
    createClient,
    updateClient,
    deleteClient,
    isDuplicate,
    refresh: loadClients
  };
}