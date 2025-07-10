"use client"

import { useState, useEffect, createContext, useContext } from "react"
import type { User } from "@supabase/supabase-js"
import type { ReactNode } from "react"
import { useSessionContext, useUser as useSupaUser } from "@supabase/auth-helpers-react"

// Define types for the user profile and subscription
export interface ContractorProfile {
  id: string
  user_id: string
  company_name: string
  onboarded: boolean
  // Add other profile fields as needed
}

export interface Subscription {
  id: string
  user_id: string
  status: "trialing" | "active" | "canceled" | "incomplete" | "past_due"
  // Add other subscription fields as needed
}

// Define the shape of the context value
export interface UserContextType {
  accessToken: string | null
  user: User | null
  profile: ContractorProfile | null
  subscription: Subscription | null
  loading: boolean
  isOnboarded: boolean
}

// Create the context with a default value
const UserContext = createContext<UserContextType | undefined>(undefined)

// Create the provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { session, isLoading: isLoadingUser, supabaseClient } = useSessionContext()
  const user = useSupaUser()
  const accessToken = session?.access_token ?? null

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<ContractorProfile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true)
        try {
          const [profileResponse, subscriptionResponse] = await Promise.all([
            supabaseClient.from("contractor_profiles").select("*").eq("user_id", user.id).single(),
            supabaseClient
              .from("subscriptions")
              .select("*")
              .eq("user_id", user.id)
              .in("status", ["trialing", "active"])
              .single(),
          ])

          if (profileResponse.data) {
            setProfile(profileResponse.data as ContractorProfile)
          }

          if (subscriptionResponse.data) {
            setSubscription(subscriptionResponse.data as Subscription)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setProfile(null)
        setSubscription(null)
        setLoading(false)
      }
    }

    if (!isLoadingUser) {
      fetchData()
    }
  }, [user, isLoadingUser, supabaseClient])

  const value = {
    accessToken,
    user,
    profile,
    subscription,
    loading: loading || isLoadingUser,
    isOnboarded: profile?.onboarded ?? false,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

// Custom hook to use the user context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
