"use client"

import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { useSessionContext, useUser as useSupaUser } from "@supabase/auth-helpers-react"
import { UserContext, type ContractorProfile, type Subscription } from "@/hooks/useUser"
import { getDemoSession, getDemoContractorProfile } from "@/lib/demoSession"

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { session, isLoading: isLoadingUser, supabaseClient } = useSessionContext()
  const user = useSupaUser()
  const accessToken = session?.access_token ?? null

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<ContractorProfile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      // Check for demo session first (browser-only check)
      if (typeof window !== 'undefined') {
        const demoSession = getDemoSession()
        if (demoSession && demoSession.demo_mode) {
          console.log('[USER PROVIDER] Demo session detected:', demoSession.demo_profile_type)
          setLoading(true)
          
          try {
            // Get demo contractor profile
            const demoProfile = getDemoContractorProfile(demoSession)
            if (demoProfile) {
              // Convert demo profile to expected format
              const convertedProfile: ContractorProfile = {
                id: demoProfile.id,
                user_id: demoProfile.user_id,
                company_name: demoProfile.company_name,
                contact_name: demoProfile.company_name, // Use company name as contact
                onboarded: demoProfile.onboarding_completed,
                subscription_tier: demoProfile.tier,
                services_offered: demoProfile.services
              }
              setProfile(convertedProfile)
              console.log('[USER PROVIDER] Demo profile set:', convertedProfile)
            }
          } catch (error) {
            console.error('[USER PROVIDER] Error setting demo profile:', error)
          } finally {
            setLoading(false)
          }
          return // Exit early for demo mode
        }
      }

      // Normal Supabase session handling
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
