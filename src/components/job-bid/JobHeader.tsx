"use client"

import type React from "react"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, DollarSign } from "lucide-react"

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

interface JobHeaderProps {
  job: JobDetails
  getUrgencyColor: (urgency: string) => string
  getSourceColor: (source: string) => string
  formatBudget: (min: number, max: number) => string
}

export function JobHeader({ job, getUrgencyColor, getSourceColor, formatBudget }: JobHeaderProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return "Unknown date"
    }
  }

  return (
    <div className="border-b border-border pb-6 mb-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-start justify-between">
          <h1 className="text-3xl font-bold text-foreground">{job.title}</h1>
          <div className="flex gap-2">
            <Badge variant="outline" className={getUrgencyColor(job.urgency)}>
              {job.urgency} priority
            </Badge>
            <Badge variant="outline" className={getSourceColor(job.source)}>
              {job.source.replace("_", " ")}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {job.location}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Posted {formatDate(job.posted_at)}
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            {formatBudget(job.budget_min, job.budget_max)}
          </div>
        </div>
      </div>
    </div>
  )
}
