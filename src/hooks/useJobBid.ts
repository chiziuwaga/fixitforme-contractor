"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface JobDetails {
  id: string
  title: string
  description: string
  budget_min: number
  budget_max: number
  location: string
  posted_at: string
  urgency: "low" | "medium" | "high"
  felix_category: string
  source: "felix_referral" | "rex_discovery" | "direct_inquiry"
  homeowner_name?: string
  homeowner_phone?: string
  requirements: string[]
  timeline_preference: string
}

export function useJobBid() {
  const params = useParams()
  const jobId = params?.job_id as string
  const supabase = createClientComponentClient()
  
  const [job, setJob] = useState<JobDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bidAmount, setBidAmount] = useState("")
  const [coverLetter, setCoverLetter] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Real database integration - Load job/lead details from contractor_leads table
  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true)
      setError(null)
      
      try {
        if (!jobId) {
          throw new Error("No job ID provided")
        }

        // Fetch job details from contractor_leads table (Rex algorithm results)
        const { data: leadData, error: leadError } = await supabase
          .from('contractor_leads')
          .select(`
            *,
            felix_categories(category_name)
          `)
          .eq('id', jobId)
          .single()

        if (leadError) {
          // If not found in contractor_leads, try the jobs table
          const { data: jobData, error: jobError } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .single()

          if (jobError) {
            throw new Error("Job not found")
          }

          // Convert job data to JobDetails format
          const jobDetails: JobDetails = {
            id: jobData.id,
            title: jobData.title,
            description: jobData.description,
            budget_min: jobData.budget_min || 0,
            budget_max: jobData.budget_max || 0,
            location: jobData.location || "Location not specified",
            posted_at: jobData.created_at || new Date().toISOString(),
            urgency: jobData.urgency_level || "medium",
            felix_category: "General",
            source: "direct_inquiry",
            requirements: jobData.requirements || [],
            timeline_preference: jobData.timeline_preference || "Flexible"
          }
          setJob(jobDetails)
        } else {
          // Convert lead data to JobDetails format (Rex-generated leads)
          const jobDetails: JobDetails = {
            id: leadData.id,
            title: leadData.title,
            description: leadData.description,
            budget_min: leadData.estimated_value ? Math.floor(leadData.estimated_value * 0.8) : 0,
            budget_max: leadData.estimated_value || 0,
            location: `${leadData.location_city}, ${leadData.location_state}`,
            posted_at: leadData.posted_at || new Date().toISOString(),
            urgency: leadData.urgency_indicators?.includes('urgent') ? "high" : "medium",
            felix_category: leadData.felix_categories?.category_name || "General",
            source: "rex_discovery",
            requirements: ["Valid contractor license", "Insurance coverage required"],
            timeline_preference: leadData.urgency_indicators?.includes('urgent') ? "ASAP" : "Flexible"
          }
          setJob(jobDetails)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load job details")
        console.error("Error fetching job:", err)
      } finally {
        setLoading(false)
      }
    }

    if (jobId) {
      fetchJob()
    }
  }, [jobId, supabase])

  const submitBid = async () => {
    setIsLoading(true)
    console.log("Submitting bid for job:", jobId, { bidAmount, coverLetter })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast.success("Your bid has been submitted successfully!")
    setIsLoading(false)
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "text-destructive"
      case "medium": return "text-yellow-500"
      case "low": return "text-primary"
      default: return "text-muted-foreground"
    }
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case "felix_referral": return "text-primary"
      case "rex_discovery": return "text-secondary"
      case "direct_inquiry": return "text-green-600"
      default: return "text-muted-foreground"
    }
  }

  const formatBudget = (min: number, max: number) => {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`
  }

  return {
    job,
    loading,
    error,
    bidAmount,
    setBidAmount,
    coverLetter,
    setCoverLetter,
    isLoading,
    submitBid,
    getUrgencyColor,
    getSourceColor,
    formatBudget,
  }
}
