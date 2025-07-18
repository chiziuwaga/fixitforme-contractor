import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side only Supabase client for hooks and browser components
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
