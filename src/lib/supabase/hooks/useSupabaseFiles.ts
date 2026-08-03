import { useState, useEffect, useCallback } from 'react';
import { supabaseServices } from '../services';
import type { Repository } from '../types';
import { vaultFiles as seedFiles } from '@/data/files';

export function useSupabaseFiles() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load files from localStorage (for now, until we have a files table)
  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      // For now, we'll use the existing localStorage approach
      // In the future, this will load from Supabase repositories table
      const stored = localStorage.getItem('bpo-nexus:files');
      if (stored) {
        setFiles(JSON.parse(stored));
      } else {
        setFiles(seedFiles);
      }
    } catch (err) {
      console.warn('Failed to load files, using seed data:', err);
      setFiles(seedFiles);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize files on mount
  useEffect(() => {
    loadFiles().catch(setError);
  }, [loadFiles]);

  // Persist files to localStorage
  const persistFiles = useCallback((filesToSave: any[]) => {
    try {
      localStorage.setItem('bpo-nexus:files', JSON.stringify(filesToSave));
      setFiles(filesToSave);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to persist files'));
      throw err;
    }
  }, []);

  // Add a new file
  const addFile = useCallback(async (fileData: Omit<any, 'id'>) => {
    try {
      const newFile = { ...fileData, id: `f${Date.now()}` };
      const updatedFiles = [newFile, ...files];
      persistFiles(updatedFiles);
      return newFile;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add file'));
      throw err;
    }
  }, [files, persistFiles]);

  // Update an existing file
  const updateFile = useCallback(async (id: string, updates: Partial<any>) => {
    try {
      const updatedFiles = files.map(file => file.id === id ? { ...file, ...updates } : file);
      persistFiles(updatedFiles);
      return updatedFiles.find(file => file.id === id);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update file'));
      throw err;
    }
  }, [files, persistFiles]);

  // Delete a file
  const deleteFile = useCallback(async (id: string) => {
    try {
      const updatedFiles = files.filter(file => file.id !== id);
      persistFiles(updatedFiles);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete file'));
      throw err;
    }
  }, [files, persistFiles]);

  return {
    files,
    loading,
    error,
    addFile,
    updateFile,
    deleteFile,
    refresh: loadFiles
  };
}