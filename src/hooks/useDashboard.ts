"use client"

import { useState, useEffect, useCallback } from "react"
import { useUser } from "@/providers/UserProvider"
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

export function useDashboard() {
  const { user } = useUser()
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
    if (!user) return

    setLoading(true)
    try {
      // In a real app, these would be parallel API calls or a single RPC call to a db function
      // For now, we'll use mock data fetching
      const fetchStats = async () => {
        await new Promise((res) => setTimeout(res, 500)) // simulate network delay
        return {
          totalRevenue: 12450,
          activeJobs: 8,
          jobsCompleted: 23,
          conversionRate: 68,
        }
      }

      const fetchLeads = async () => {
        await new Promise((res) => setTimeout(res, 800)) // simulate network delay
        return [
          {
            id: "1",
            title: "Kitchen Cabinet Installation",
            description: "Looking for an experienced contractor to install new kitchen cabinets and countertops.",
            budget_min: 2500,
            budget_max: 4000,
            location: "Oakland, CA",
            posted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            urgency: "medium",
            source: "rex_discovery",
            viewed: false,
            quality_score: 8.5,
          },
          {
            id: "2",
            title: "Emergency Plumbing Leak Repair",
            description: "Have a major leak under the bathroom sink that needs immediate attention.",
            budget_min: 300,
            budget_max: 600,
            location: "Berkeley, CA",
            posted_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            urgency: "high",
            source: "felix_referral",
            viewed: true,
            quality_score: 9.2,
          },
        ] as Lead[]
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
  }, [user, supabase])

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
