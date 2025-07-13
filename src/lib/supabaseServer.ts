import { cookies as nextCookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function createClient() {
  // Provide a CookieMethodsServer implementation for SSR
  const cookies = {
    get: async (name: string) => {
      const cookieStore = await nextCookies();
      const c = await cookieStore.get(name);
      return c?.value;
    },
    getAll: async () => {
      const cookieStore = await nextCookies();
      return (await cookieStore.getAll()).map(c => ({ name: c.name, value: c.value }));
    },
    set: async () => {},
    delete: async () => {},
  };
  return createServerClient(supabaseUrl, supabaseAnonKey, { cookies });
}

export function createAdminClient() {
  const cookies = {
    get: async (name: string) => {
      const cookieStore = await nextCookies();
      const c = await cookieStore.get(name);
      return c?.value;
    },
    getAll: async () => {
      const cookieStore = await nextCookies();
      return (await cookieStore.getAll()).map(c => ({ name: c.name, value: c.value }));
    },
    set: async () => {},
    delete: async () => {},
  };
  return createServerClient(supabaseUrl, supabaseServiceRoleKey, { 
    cookies,
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
