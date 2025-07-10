"use client"

import type { ReactNode } from "react"
import { SessionContextProvider } from "@supabase/auth-helpers-react"
import { supabase } from "@/lib/supabase"

export const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  return <SessionContextProvider supabaseClient={supabase}>{children}</SessionContextProvider>
}
