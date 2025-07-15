"use client"

import type React from "react"

import AppLayout from "@/components/layout/AppLayout"
import { useUser } from "@/hooks/useUser"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ContractorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useUser()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  // SSR safety check
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!loading && isClient) {
      // PURE WHATSAPP OTP - Only check for WhatsApp direct access
      const whatsappUser = localStorage.getItem('whatsapp_verified_user');
      const directAccess = localStorage.getItem('direct_access');
      
      if (!whatsappUser || !directAccess) {
        console.log('[CONTRACTOR LAYOUT] No WhatsApp authentication found, redirecting to login')
        router.push("/login")
      } else {
        console.log('[CONTRACTOR LAYOUT] WhatsApp user authenticated - allowing access');
      }
    }
  }, [loading, router, isClient])

  // Show loading if still loading or no client-side rendering yet
  if (loading || !isClient) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  // Check authentication (WhatsApp OTP ONLY)
  const whatsappUser = typeof window !== 'undefined' ? localStorage.getItem('whatsapp_verified_user') : null;
  const directAccess = typeof window !== 'undefined' ? localStorage.getItem('direct_access') : null;
  
  if (!whatsappUser || !directAccess) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Redirecting to login...</p>
      </div>
    )
  }

  return <AppLayout>{children}</AppLayout>
}
