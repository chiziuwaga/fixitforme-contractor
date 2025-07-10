"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/providers/UserProvider"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { loading, user, isOnboarded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else if (!isOnboarded) {
        router.push("/contractor/onboarding")
      } else {
        router.push("/contractor/dashboard")
      }
    }
  }, [loading, user, isOnboarded, router])

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
