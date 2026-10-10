import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../client';

export interface VaultFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  storage_path: string;
  project_id?: string;
  category?: string;
  tags?: string[];
  created_at?: string;
}

export function useSupabaseFiles() {
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch file metadata from the repositories table
  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: dbError } = await supabase
        .from('repositories')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;
      setFiles(data || []);
    } catch (err) {
      console.error('Failed to fetch vault files:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch files'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Upload file to Supabase Storage bucket 'vault' and record metadata in DB
  const uploadFile = useCallback(async (file: File, metadata?: { projectId?: string; category?: string; tags?: string[] }) => {
    try {
      setError(null);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // 1. Upload binary file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('vault')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('vault')
        .getPublicUrl(filePath);

      // 3. Save metadata record into database
      const newRecord = {
        name: file.name,
        size: file.size,
        type: file.type || fileExt || 'unknown',
        url: publicUrl,
        storage_path: filePath,
        project_id: metadata?.projectId || null,
        category: metadata?.category || 'general',
        tags: metadata?.tags || [],
      };

      const { data: dbData, error: dbError } = await supabase
        .from('repositories')
        .insert([newRecord])
        .select()
        .single();

      if (dbError) throw dbError;

      setFiles(prev => [dbData, ...prev]);
      return dbData;
    } catch (err) {
      console.error('Failed to upload file:', err);
      const fileErr = err instanceof Error ? err : new Error('Failed to upload file');
      setError(fileErr);
      throw fileErr;
    }
  }, []);

  // Delete file from both Storage and Database
  const deleteFile = useCallback(async (id: string, storagePath: string) => {
    try {
      setError(null);

      // 1. Delete from Supabase Storage if path exists
      if (storagePath) {
        const { error: storageError } = await supabase.storage
          .from('vault')
          .remove([storagePath]);
        if (storageError) console.warn('Storage deletion warning:', storageError);
      }

      // 2. Delete record from database
      const { error: dbError } = await supabase
        .from('repositories')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      setFiles(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      console.error('Failed to delete file:', err);
      const delErr = err instanceof Error ? err : new Error('Failed to delete file');
      setError(delErr);
      throw delErr;
    }
  }, []);

  return {
    files,
    loading,
    error,
    uploadFile,
    deleteFile,
    refresh: fetchFiles
  };
}