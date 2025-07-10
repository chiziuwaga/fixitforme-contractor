"use client"

import { useState } from "react"
import { toast } from "sonner"

type Plan = "Free" | "Growth" | "Scale"

interface SubscriptionState {
  plan: Plan
  status: "active" | "inactive"
  billing_period_end: Date | null
}

export function useSubscription() {
  const [loading, setLoading] = useState(false)
  const [subscription] = useState<SubscriptionState>({
    plan: "Growth",
    status: "active",
    billing_period_end: new Date(new Date().setDate(new Date().getDate() + 30)), // 30 days from now
  })

  const handleManageSubscription = () => {
    setLoading(true)
    toast.info("Redirecting to billing portal...", {
      description: "This is a placeholder. In a real app, this would redirect to Stripe.",
    })
    setTimeout(() => {
      setLoading(false)
    }, 1500)
  }

  return {
    loading,
    subscription,
    handleManageSubscription,
  }
}
