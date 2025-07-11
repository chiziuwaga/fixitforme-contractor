"use client"


import type { ReactNode } from "react";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { createBrowserClient } from "@/lib/supabaseClient";

export const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createBrowserClient();
  return (
    <SessionContextProvider supabaseClient={supabase}>
      {children}
    </SessionContextProvider>
  );
};
