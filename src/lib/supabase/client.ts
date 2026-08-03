import { createClient } from '@supabase/supabase-js'

// Type definitions for environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export types for better TypeScript support
export type SupabaseClient = typeof supabase