"use client"

import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { createClient } from "@/lib/supabase-client"
import { UserContext, type ContractorProfile, type Subscription } from "@/hooks/useUser"

export const UserProvider = ({ children }: { children: ReactNode }) => {
  // PURE WHATSAPP OTP - No Supabase session dependencies
  const supabaseClient = createClient()
  
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<ContractorProfile | null>(null)
  const [subscription] = useState<Subscription | null>(null)
  const [whatsappUser, setWhatsappUser] = useState<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any

  useEffect(() => {
    const loadWhatsAppUser = async () => {
      // ONLY CHECK FOR WHATSAPP VERIFIED USERS
      const storedUser = localStorage.getItem('whatsapp_verified_user');
      const directAccess = localStorage.getItem('direct_access');
      const cachedProfile = localStorage.getItem('contractor_profile');
      
      if (storedUser && directAccess) {
        try {
          const userData = JSON.parse(storedUser);
          console.log('[USER PROVIDER] Loading WhatsApp verified user:', userData.id);
          
          setWhatsappUser(userData);
          
          // Load contractor profile
          if (cachedProfile) {
            const profileData = JSON.parse(cachedProfile);
            setProfile(profileData as ContractorProfile);
            console.log('[USER PROVIDER] Profile loaded from cache');
          } else {
            // Fetch from database using phone
            const { data: profileData } = await supabaseClient
              .from("contractor_profiles")
              .select("*")
              .eq("contact_phone", userData.phone)
              .single()
            
            if (profileData) {
              setProfile(profileData as ContractorProfile);
              localStorage.setItem('contractor_profile', JSON.stringify(profileData));
              console.log('[USER PROVIDER] Profile loaded from database');
            }
          }
        } catch (error) {
          console.error("Error loading WhatsApp user:", error)
          // Clear invalid data
          localStorage.removeItem('whatsapp_verified_user');
          localStorage.removeItem('direct_access');
          localStorage.removeItem('contractor_profile');
        }
      } else {
        console.log('[USER PROVIDER] No WhatsApp authenticated user found');
        setWhatsappUser(null);
        setProfile(null);
      }
      
      setLoading(false);
    }

    loadWhatsAppUser();
  }, [supabaseClient])

  const value = {
    accessToken: null, // No access tokens needed for WhatsApp OTP
    user: whatsappUser, // Only WhatsApp verified users
    profile,
    subscription,
    loading,
    isOnboarded: profile?.onboarded ?? false,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
