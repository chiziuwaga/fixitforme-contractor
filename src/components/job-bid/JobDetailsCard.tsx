"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, User } from "lucide-react"

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

interface JobDetailsCardProps {
  job: JobDetails
  getUrgencyColor: (urgency: string) => string
  getSourceColor: (source: string) => string
  formatBudget: (min: number, max: number) => string
}

export function JobDetailsCard({ job }: JobDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Details</CardTitle>
        <CardDescription>Complete project information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground">{job.description}</p>
        </div>

        {job.homeowner_name && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Client:</span>
            <span>{job.homeowner_name}</span>
            {job.homeowner_phone && (
              <span className="text-muted-foreground">• {job.homeowner_phone}</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Timeline:</span>
          <span>{job.timeline_preference}</span>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Requirements</h3>
          <div className="flex flex-wrap gap-2">
            {job.requirements.map((req, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                {req}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Badge className="bg-primary/10 text-primary">
            {job.felix_category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
