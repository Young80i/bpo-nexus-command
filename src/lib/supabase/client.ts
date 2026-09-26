import { createClient } from '@supabase/supabase-js'

// Type definitions for environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
if (!isSupabaseConfigured) {
  console.warn('Supabase env vars missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY); cloud sync disabled.')
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
)

// Export types for better TypeScript support
export type SupabaseClient = typeof supabase