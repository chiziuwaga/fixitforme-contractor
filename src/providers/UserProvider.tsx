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
      // Check for WhatsApp verified user first (pure WhatsApp OTP)
      const whatsappUser = localStorage.getItem('whatsapp_verified_user');
      if (whatsappUser) {
        try {
          const whatsappUserData = JSON.parse(whatsappUser);
          console.log('[USER PROVIDER] Using WhatsApp verified user:', whatsappUserData.id);
          
          // Fetch contractor profile using phone number
          const { data: profileData } = await supabaseClient
            .from("contractor_profiles")
            .select("*")
            .eq("contact_phone", whatsappUserData.phone)
            .single()
          
          if (profileData) {
            setProfile(profileData as ContractorProfile);
            console.log('[USER PROVIDER] Profile loaded via WhatsApp auth');
          }
        } catch (error) {
          console.error("Error fetching WhatsApp user profile:", error)
        }
        setLoading(false)
        return;
      }
      
      // Fallback: Normal Supabase session handling (if session exists)
      if (user) {
        setLoading(true)
        try {
          const { data: profileData } = await supabaseClient
            .from("contractor_profiles")
            .select("*")
            .eq("user_id", user.id)
            .single()
          setProfile(profileData as ContractorProfile)
          console.log('[USER PROVIDER] Profile loaded via Supabase session');
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
