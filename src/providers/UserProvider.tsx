"use client"

import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { useSessionContext, useUser as useSupaUser } from "@supabase/auth-helpers-react"
import { UserContext, type ContractorProfile, type Subscription } from "@/hooks/useUser"

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
          const { data: profileData } = await supabaseClient
            .from("contractor_profiles")
            .select("*")
            .eq("user_id", user.id)
            .single()
          setProfile(profileData as ContractorProfile)
        } catch (error) {
          console.error("Error fetching user profile:", error)
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
