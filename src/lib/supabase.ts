import { cookies as nextCookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createClient() {
  // Provide a CookieMethodsServer implementation for SSR
  const cookies = {
    get: async (name: string) => {
      const cookieStore = await nextCookies();
      return cookieStore.get(name)?.value;
    },
    set: async (name: string, value: string, options: any) => {
      const cookieStore = await nextCookies();
      cookieStore.set(name, value, options);
    },
    remove: async (name: string, options: any) => {
      const cookieStore = await nextCookies();
      cookieStore.set(name, '', { ...options, maxAge: 0 });
    },
  };

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies,
  });
}

// createClient is already exported by the function declaration above
// No need for additional export statement


