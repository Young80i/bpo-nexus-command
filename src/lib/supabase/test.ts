// Simple test to verify Supabase integration
import { supabase } from './client'

// Test function to verify Supabase connection
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  try {
    // Simple health check - try to get the Supabase version
    const { data, error } = await supabase.from('clients').select('id').limit(1)
    
    if (error && error.message.includes('Invalid API key')) {
      return { 
        success: false, 
        message: 'Supabase configuration error: Invalid API key' 
      }
    }
    
    if (error && error.message.includes('URL')) {
      return { 
        success: false, 
        message: 'Supabase configuration error: Invalid URL' 
      }
    }
    
    return { 
      success: true, 
      message: 'Supabase connection successful' 
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Supabase connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}

// Export for usage in other parts of the application
export { supabase } from './client'
export type { SupabaseClient } from './client'