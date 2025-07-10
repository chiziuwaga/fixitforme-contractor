"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useParams } from "next/navigation"

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
  
  const [job, setJob] = useState<JobDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bidAmount, setBidAmount] = useState("")
  const [coverLetter, setCoverLetter] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Mock job data for development
  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Mock job data
        const mockJob: JobDetails = {
          id: jobId || "job_123",
          title: "Kitchen Remodel - Oakland Hills",
          description: "Complete kitchen renovation needed. Looking for experienced contractor to handle cabinets, countertops, and flooring.",
          budget_min: 8000,
          budget_max: 15000,
          location: "Oakland Hills, CA",
          posted_at: new Date().toISOString(),
          urgency: "medium",
          felix_category: "Kitchen remodel",
          source: "felix_referral",
          homeowner_name: "Sarah Johnson",
          homeowner_phone: "(510) 555-0123",
          requirements: ["Licensed contractor", "Insurance required", "References needed"],
          timeline_preference: "Start within 2 weeks"
        }
        
        setJob(mockJob)
      } catch (err) {
        setError("Failed to load job details")
        console.error("Error fetching job:", err)
      } finally {
        setLoading(false)
      }
    }

    if (jobId) {
      fetchJob()
    }
  }, [jobId])

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
      case "rex_discovery": return "text-blue-600"
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
