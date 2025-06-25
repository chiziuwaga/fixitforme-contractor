import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Environment variables with proper error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Contractor session configuration (48 hours)
const contractorSessionConfig = {
  auth: {
    // 48-hour contractor login sessions
    sessionTimeout: 172800, // 48 hours in seconds
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' as const,
    debug: process.env.NODE_ENV === 'development'
  }
}

// Main client instance for authenticated operations
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, contractorSessionConfig)

// Admin client for server-side operations (only if service key is available)
export const supabaseAdmin = supabaseServiceKey 
  ? createSupabaseClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Create a new client instance (for server-side use)
export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase configuration is missing')
  }
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, contractorSessionConfig)
}

// Agent operation timeout (10 minutes)
export const AGENT_OPERATION_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

// Utility function for wrapping agent operations with timeout
export async function withTimeout<T>(
  promise: Promise<T>, 
  timeoutMs: number = AGENT_OPERATION_TIMEOUT
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
  );
  
  return Promise.race([promise, timeoutPromise]);
}
