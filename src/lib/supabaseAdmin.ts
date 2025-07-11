import { createServerClient } from '@supabase/ssr';

// Minimal no-op CookieMethodsServer implementation for admin client
const emptyCookies = {
  get: () => undefined,
  getAll: () => [],
  set: () => {},
  delete: () => {},
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function createAdminClient() {
  // For admin/service role, cookies are not required. Pass a no-op cookies implementation.
  return createServerClient(supabaseUrl, supabaseServiceRoleKey, { cookies: emptyCookies });
}
