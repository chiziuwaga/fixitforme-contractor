"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { JobDetails } from "@/components/job-bid/types"

export function useJobBid() {
  const params = useParams()
  const jobId = params?.job_id as string
  const [job, setJob] = useState<JobDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) {
        setLoading(false)
        setError("No job ID provided.")
        return
      }

      try {
        setLoading(true)
        const { data, error: dbError } = await supabase.from("leads").select("*").eq("id", jobId).single()

        if (dbError) throw dbError
        if (!data) throw new Error("Job not found.")

        setJob(data)
      } catch (err: any) {
        console.error("Error fetching job details:", err)
        setError(err.message || "Failed to fetch job details.")
      } finally {
        setLoading(false)
      }
    }

    fetchJobDetails()
  }, [jobId])

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "medium":
        return "bg-warning/10 text-warning border-warning/20"
      case "low":
        return "bg-success/10 text-success border-success/20"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case "felix_referral":
        return "bg-info/10 text-info border-info/20"
      case "rex_discovery":
        return "bg-secondary/10 text-secondary border-secondary/20"
      case "direct_inquiry":
        return "bg-accent/10 text-accent border-accent/20"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const formatBudget = (min: number, max: number) => {
    if (!min && !max) return "Not specified"
    if (min === max) return `$${min.toLocaleString()}`
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`
  }

  return {
    job,
    loading,
    error,
    getUrgencyColor,
    getSourceColor,
    formatBudget,
  }
}
