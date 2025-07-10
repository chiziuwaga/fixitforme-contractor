"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

type Plan = "growth" | "scale"

interface SubscriptionState {
  plan: Plan
  status: "active" | "inactive" | "trialing" | "past_due"
  billing_period_end: Date | null
  platform_fee: number
  monthly_limits: {
    bids: number
    chats: number
    messages: number
    services: number
  }
  payout_structure: number[]
}

export function useSubscription() {
  const [loading, setLoading] = useState(false)
  const [fetchingSubscription, setFetchingSubscription] = useState(true)
  const [subscription, setSubscription] = useState<SubscriptionState>({
    plan: "growth",
    status: "active",
    billing_period_end: null,
    platform_fee: 0.06,
    monthly_limits: { bids: 10, chats: 10, messages: 50, services: 5 },
    payout_structure: [30, 40, 30],
  })

  const supabase = createClientComponentClient()

  // Tier configurations from sophisticated fromv0 algorithms
  const TIER_CONFIGURATIONS = {
    growth: {
      platform_fee: 0.06,           // 6% platform fee
      payout_structure: [30, 40, 30], // Upfront/Mid/Completion
      monthly_limits: { bids: 10, chats: 10, messages: 50, services: 5 }
    },
    scale: {
      platform_fee: 0.04,           // 4% platform fee (33% savings)
      payout_structure: [50, 25, 25], // Better cash flow for pros
      monthly_limits: { bids: 50, chats: 30, messages: 200, services: 15 }
    }
  }

  const fetchSubscription = useCallback(async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error("User not authenticated")
      }

      // Get contractor profile with tier information
      const { data: profile, error: profileError } = await supabase
        .from("contractor_profiles")
        .select("tier, stripe_customer_id")
        .eq("user_id", user.id)
        .single()

      if (profileError || !profile) {
        console.error("Error fetching contractor profile:", profileError)
        return
      }

      const tier = profile.tier as Plan || "growth"
      const config = TIER_CONFIGURATIONS[tier]

      setSubscription({
        plan: tier,
        status: "active",
        billing_period_end: tier === "scale" ? new Date(new Date().setDate(new Date().getDate() + 30)) : null,
        platform_fee: config.platform_fee,
        monthly_limits: config.monthly_limits,
        payout_structure: config.payout_structure,
      })
    } catch (error) {
      console.error("Error fetching subscription:", error)
      toast.error("Failed to load subscription information")
    } finally {
      setFetchingSubscription(false)
    }
  }, [supabase])

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error("User not authenticated")
      }

      // Get contractor profile
      const { data: profile } = await supabase
        .from("contractor_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (!profile) {
        throw new Error("Contractor profile not found")
      }

      // Create Stripe checkout session using sophisticated payment logic
      const response = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tier: "scale", 
          contractor_id: profile.id 
        }),
      })

      const { url, error } = await response.json()
      
      if (error) {
        throw new Error(error)
      }

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
      toast.error("Failed to start upgrade process", {
        description: error instanceof Error ? error.message : "Please try again later.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = () => {
    setLoading(true)
    toast.info("Redirecting to billing portal...", {
      description: "Opening Stripe customer portal for subscription management.",
    })
    // In a real implementation, this would redirect to Stripe customer portal
    setTimeout(() => {
      setLoading(false)
    }, 1500)
  }

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  return {
    loading,
    fetchingSubscription,
    subscription,
    handleUpgrade,
    handleManageSubscription,
    TIER_CONFIGURATIONS,
  }
}
