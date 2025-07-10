"use client"

import { useContext, createContext } from "react"
import type { User } from "@supabase/supabase-js"

export interface ContractorProfile {
  id: string
  user_id: string
  company_name: string | null
  contact_name: string | null
  onboarded: boolean
  subscription_tier: "growth" | "scale"
  services_offered: string[]
}

export interface Subscription {
  id: string
  user_id: string
  status: "trialing" | "active" | "canceled" | "incomplete" | "past_due"
}

export interface UserContextType {
  accessToken: string | null
  user: User | null
  profile: ContractorProfile | null
  subscription: Subscription | null
  loading: boolean
  isOnboarded: boolean
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUser = (): UserContextType => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider.")
  }
  return context
}
