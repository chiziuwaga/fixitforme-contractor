import { createBrowserClient } from '@supabase/ssr';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase client for browser/hooks usage
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Server-side Supabase client for API routes and server components
export async function createServerSupabaseClient() {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: (name: string) => cookieStore.get(name)?.value,
      set: (name: string, value: string, options: { [key: string]: unknown }) => {
        cookieStore.set(name, value, options);
      },
      remove: (name: string, options: { [key: string]: unknown }) => {
        cookieStore.set(name, '', { ...options, maxAge: 0 });
      },
    },
  });
}


