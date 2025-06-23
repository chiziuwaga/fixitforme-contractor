'use client';

import { useState, ReactNode } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { SupabaseClient } from '@supabase/supabase-js';

interface SupabaseProviderProps {
  children: ReactNode;
}

export const SupabaseProvider = ({ children }: SupabaseProviderProps) => {
  const [supabaseClient] = useState(() =>
    createPagesBrowserClient()
  );

  return (
    <SessionContextProvider supabaseClient={supabaseClient as SupabaseClient}>
      {children}
    </SessionContextProvider>
  );
};
