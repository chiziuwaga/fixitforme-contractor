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

// Contractor session configuration optimized for auth-helpers compatibility
const contractorSessionConfig = {
  auth: {
    // 48-hour contractor login sessions
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' as const,
    debug: process.env.NODE_ENV === 'development',
    // Unique storage key to prevent conflicts
    storageKey: 'sb-fixitforme-contractor-auth-token'
  },
  global: {
    headers: {
      'X-Client-Info': 'fixitforme-contractor'
    }
  }
}

// SINGLE CLIENT INSTANCE - Use this everywhere for consistency
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, contractorSessionConfig)

// Admin client for server-side operations (only if service key is available)
export const supabaseAdmin = supabaseServiceKey 
  ? createSupabaseClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        storageKey: 'sb-fixitforme-admin-auth-token' // Separate storage key
      }
    })
  : null

// Export for backward compatibility
export const createClient = () => supabase

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
