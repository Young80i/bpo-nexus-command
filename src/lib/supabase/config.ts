// Supabase configuration
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '',
  
  // Validate configuration
  isValid: (): boolean => {
    return !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY
  },
  
  // Get validation errors
  getValidationErrors: (): string[] => {
    const errors: string[] = []
    
    if (!import.meta.env.VITE_SUPABASE_URL) {
      errors.push('Missing VITE_SUPABASE_URL environment variable')
    }
    
    if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
      errors.push('Missing VITE_SUPABASE_ANON_KEY environment variable')
    }
    
    return errors
  }
}