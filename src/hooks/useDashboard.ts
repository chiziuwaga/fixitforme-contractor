"use client"

import { useState, useEffect, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"

export interface DashboardStats {
  totalRevenue: number
  activeJobs: number
  jobsCompleted: number
  conversionRate: number
}

export interface Lead {
  id: string
  title: string
  description: string
  budget_min: number
  budget_max: number
  location: string
  posted_at: string
  urgency: "low" | "medium" | "high"
  source: "felix_referral" | "rex_discovery" | "direct_inquiry"
  viewed: boolean
  quality_score: number
}

interface ContractorProfile {
  id: string
  user_id: string
  tier: string
  rex_search_usage: number
  current_bids_this_month: number
}

interface DatabaseLead {
  id: string
  title: string
  description: string
  budget_min: number
  budget_max: number
  location: string
  posted_at: string
  urgency_level: "low" | "medium" | "high"
  source: "felix_referral" | "rex_discovery" | "direct_inquiry"
  viewed: boolean
  relevance_score: number
}

export function useDashboard() {
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    activeJobs: 0,
    jobsCompleted: 0,
    conversionRate: 0,
  })
  const [leads, setLeads] = useState<Lead[]>([])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error("User not authenticated")
      }

      // Real Supabase integration - Connect to sophisticated backend algorithms
      const fetchStats = async () => {
        // Get contractor profile and current tier
        const { data: profile } = await supabase
          .from("contractor_profiles")
          .select("id, tier, rex_search_usage, current_bids_this_month")
          .eq("user_id", user.id)
          .single()

        if (!profile) {
          return {
            totalRevenue: 0,
            activeJobs: 0,
            jobsCompleted: 0,
            conversionRate: 0,
          }
        }

        // Calculate stats from real data
        const { data: jobs } = await supabase
          .from("jobs")
          .select("status, total_amount")
          .eq("contractor_id", profile.id)

        const { data: bids } = await supabase
          .from("bids")
          .select("status, amount")
          .eq("contractor_id", profile.id)

        const activeJobs = jobs?.filter(j => j.status === 'active').length || 0
        const completedJobs = jobs?.filter(j => j.status === 'completed').length || 0
        const totalRevenue = jobs?.reduce((sum, j) => sum + (j.total_amount || 0), 0) || 0
        const submittedBids = bids?.length || 0
        const wonBids = jobs?.length || 0
        const conversionRate = submittedBids > 0 ? Math.round((wonBids / submittedBids) * 100) : 0

        return {
          totalRevenue,
          activeJobs,
          jobsCompleted: completedJobs,
          conversionRate,
        }
      }

      const fetchLeads = async () => {
        // Get contractor profile first
        const { data: profile } = await supabase
          .from("contractor_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single()

        if (!profile) return []

        // Connect to Rex's sophisticated lead generation results
        const { data: leads } = await supabase
          .from("contractor_leads")
          .select("*")
          .eq("contractor_id", profile.id)
          .order("relevance_score", { ascending: false })
          .order("posted_at", { ascending: false })
          .limit(10)

        return leads?.map((lead: DatabaseLead) => ({
          id: lead.id,
          title: lead.title,
          description: lead.description,
          budget_min: lead.budget_min,
          budget_max: lead.budget_max,
          location: lead.location,
          posted_at: lead.posted_at,
          urgency: lead.urgency_level,
          source: lead.source,
          viewed: lead.viewed,
          quality_score: lead.relevance_score,
        })) as Lead[] || []
      }

      const [statsData, leadsData] = await Promise.all([fetchStats(), fetchLeads()])

      setStats(statsData)
      setLeads(leadsData)
    } catch (error) {
      toast.error("Failed to load dashboard data.", {
        description: error instanceof Error ? error.message : "Please try again later.",
      })
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    loading,
    stats,
    leads,
    refreshData: fetchData,
  }
}
