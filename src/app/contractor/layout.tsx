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
      if (!user) {
        console.log('[CONTRACTOR LAYOUT] No authentication found, redirecting to login')
        router.push("/login")
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

  // Check authentication (Supabase user only)
  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Redirecting to login...</p>
      </div>
    )
  }

  return <AppLayout>{children}</AppLayout>
}
