"use client"

import type React from "react"

import AppLayout from "@/components/layout/AppLayout"
import { useUser } from "@/hooks/useUser"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getDemoSession } from "@/lib/demoSession"

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
      // Check for demo session if no Supabase user
      const demoSession = getDemoSession()
      const hasAuth = user || (demoSession && demoSession.demo_mode)
      
      if (!hasAuth) {
        console.log('[CONTRACTOR LAYOUT] No authentication found, redirecting to login')
        router.push("/login")
      } else if (demoSession) {
        console.log('[CONTRACTOR LAYOUT] Demo session detected:', demoSession.demo_profile_type)
      }
    }
  }, [user, loading, router, isClient])

  // Show loading if still loading or no client-side rendering yet
  if (loading || !isClient) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  // Check authentication (Supabase user OR demo session)
  const demoSession = getDemoSession()
  const hasAuth = user || (demoSession && demoSession.demo_mode)
  
  if (!hasAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Redirecting to login...</p>
      </div>
    )
  }

  return <AppLayout>{children}</AppLayout>
}
